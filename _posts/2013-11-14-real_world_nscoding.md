---
layout: post
title: Real World NSCoding
categories: [general, demo, sample]
tags: [demo, dbyll, dbtek, sample2]
description: The code the project needs, but not the one it deserves
---


In the hillarious and painfully accurate article [Programming Sucks](http://stilldrinking.org/programming-sucks), Peter Welch said this:

>Every programmer occasionally...opens up a file on their computer...This file is Good Code. It has sensible and consistent names for functions and variables. It's concise. It doesn't do anything obviously stupid. It has never had to live in the wild, or answer to a sales team...

>Every programmer starts out writing some perfect little snowflake like this. Then they're told on Friday they need to have six hundred snowflakes written by Tuesday, so they cheat a bit here and there and maybe copy a few snowflakes and try to stick them together or they have to ask a coworker to work on one who melts it and then all the programmers' snowflakes get dumped together in some inscrutable shape...

The code in this article is not Good Code. In some places, it is in fact, Bad Code. There were opportunities to avoid this code, but sometimes sales teams and deadlines make Bad Code the Right Code for the problem. That's why this article is titled "Real World NSCoding".

## The Problem

I was recently brought in to help finish up a project that was essentially a large form. This wasn't a simple sign up form however, this was a form that rivaled a small business tax preparation (and with all the fun liability implications too!). One of the features that hadn't been implemented yet was the ability to save an incomplete form, and come back to it later by picking it from a list of forms.

Had the form been backed by something like a CoreData object, this would have been easy, but instead it was a class with hundreds of properties, and many of those properties were classes with hundreds of properties.

## NSCoding To The Rescue

If you're looking for an introduction to the subject, [NSHipster's article on NSCoding](http://nshipster.com/nscoding/) is a great place to start. For the unfamiliar, [NSCoding](https://developer.apple.com/library/ios/documentation/cocoa/reference/foundation/Protocols/NSCoding_Protocol/Reference/Reference.html) is a protocol that defines only two methods: `encodeWithCoder:` and `initWithCoder:`. NSCoding by itself isn't that interesting, but paired with [NSKeyedArchiver](https://developer.apple.com/library/ios/Documentation/Cocoa/Reference/Foundation/Classes/NSKeyedArchiver_Class/Reference/Reference.html)/[NSKeyedUnarchiver](https://developer.apple.com/library/ios/Documentation/Cocoa/Reference/Foundation/Classes/NSKeyedUnarchiver_Class/Reference/Reference.html#//apple_ref/occ/cl/NSKeyedUnarchiver) you get a powerful and flexible way to persist arbitrary data objects to the file system.

My problem was that it would be too time consuming at this point to go back and manually implement `encodeWithCoder:` and `initWithCoder:` on the dozens of classes used in the feature, and doing so would create a brittleness that would be hard to detect. I wanted to avoid situations where a developer added an NSString property to class, only to find out later that it needed to also be added to the NSCoding methods in order to be persisted.

Fortunately, the dynamic nature of the Objective-C runtime gave me some introspection tools that I could leverage to make things relatively painless.

## The Solution
I've had this method kicking around for a while (origins unknown). It's in a category for NSObject. Don't forget to `#import <objc/runtime.h>`:

{% highlight objectivec %}
- (NSMutableDictionary *)toDictionary {
    NSMutableDictionary *props = [NSMutableDictionary dictionary];
    unsigned int outCount, i;
    objc_property_t *properties = class_copyPropertyList([self class], &outCount);
    for (i = 0; i < outCount; i++) {
        objc_property_t property = properties[i];
        NSString *propertyName = [NSString stringWithFormat:@"%s", property_getName(property)];
        id propertyValue = [self valueForKey:(NSString *)propertyName];
        if (propertyValue) {
            [props setObject:propertyValue forKey:propertyName];
        } else {
            [props setObject:[NSNull null] forKey:propertyName];
        }
    }
    free(properties);
    return props;
}
{% endhighlight %}

This give us a nice NSDictionary representation of any NSObject. I made another category method that levies this dictionary to encode the object:

{% highlight objectivec %}
- (void)LJD_encodeWithCoder:(NSCoder *)aCoder {
    NSMutableDictionary *selfDictionary = [self toDictionary];
    for (id key in selfDictionary) {
        if ([selfDictionary[key] conformsToProtocol:@protocol(NSCoding)]) {
            [aCoder encodeObject:selfDictionary[key] forKey:key];
        } else {
            // For debugging
            NSLog(@"Non NSCoding: %@", key);
        }
    }
}
{% endhighlight %}
    
Then for each class I need to persist, I simply declare that they conform to the `NSCoding` protocol and add the following method:

{% highlight objectivec %}
- (void)encodeWithCoder:(NSCoder *)aCoder{
    [self LJD_encodeWithCoder:aCoder];
}
{% endhighlight %}

While there are other more "magical" ways to accomplish this (overriding methods, swizzling, custom protocols), sometimes a *little bit* of boilerplate makes it easer for developers down the line to follow what's happening.

## The Code The Project Needs, But Not The One It Deserves

So far so good, right? Get a dictionary. Encode it. Easy. Now we just need to decode it.

Here's where it get's a little gross. Here's the full, production method for you to take in (note that `VLog` is a macro that does some fun things with `NSLog` if DEBUG is defined). From that same NSObject category:

{% highlight objectivec %}
- (id)LJD_initWithCoder:(NSCoder *)aDecoder{
    NSMutableDictionary *selfDict = [self toDictionary];
    VLog(@"Decoding a %@", NSStringFromClass([self class]) );
    for (NSString *key in selfDict) {
        if (![aDecoder containsValueForKey:key]) {
            VLog(@"Warning: Did not find value for '%@'", key);
            continue;
        }
        @try {
            id value = [aDecoder decodeObjectForKey:key];
            
#ifdef DEBUG
            // For Debugging/Logging
            NSString *stringValue = [NSString stringWithFormat:@"%@", value];
            NSString *shortValue = ([stringValue length] > 10 ? [NSString stringWithFormat:@"%@...", [stringValue substringToIndex:10]] : stringValue);
#endif

            NSString *selectorName = [NSString stringWithFormat:@"set%@:", [key stringByReplacingCharactersInRange:NSMakeRange(0,1) withString:[[key substringToIndex:1] capitalizedString]]];

            if (value && value != [NSNull null] && [self respondsToSelector:NSSelectorFromString(selectorName)]) {
                [self setValue:value forKeyPath:key];
                VLog(@"Set %@.%@: %@", NSStringFromClass([self class]), key, shortValue);
            } else {
                VLog(@"Warning: Did not set %@ to %@", key, shortValue);
            }

        }
        @catch (NSException *exception) {
            VLog(@"Error with %@: %@", key, exception.debugDescription);
        }
        @finally {
            // nada
        }

    }
    return self;
};
{% endhighlight %}

Then in any class we've previously encoded:

{% highlight objectivec %}
- (id)initWithCoder:(NSCoder *)aDecoder{
    self = [super init];
    [self LJD_initWithCoder:aDecoder];
    return self;
}
{% endhighlight %}

The logging is a little verbose, but it was helpful during development (and the macros ensure they won't slow things down in production).

There's a few downsides to this approach. While it's mostly stable, we did run into crashes if a non `NSCoding` class sat inside a foundation class (like `NSArray` or `NSDictionary`). This mostly wasn't a problem, since the crashes were all the result of something we missed, and a crash made it easy to fix during production (instead of silently failing).

The other downside is this bit of code:

{% highlight objectivec %}
NSString *selectorName = [NSString stringWithFormat:@"set%@:", [key stringByReplacingCharactersInRange:NSMakeRange(0,1) withString:[[key substringToIndex:1] capitalizedString]]];

if (value && value != [NSNull null] && [self respondsToSelector:NSSelectorFromString(selectorName)])...
{% endhighlight %}
    
This is checking if it's a readonly property by looking for the selector `setValue:`. This is less than ideal, especially since you can declare custom setters for properties. However, I've never found a place where this is used in production code.

The last downside to this is side effects from calling `setValue:` type selectors. Many examples you see of NSCoding involve setting the instance variables inside of `initWithCoder:`, like so:

{% highlight objectivec %}
- (id)initWithCoder:(NSCoder *)decoder {
    self = [super init];
    if (!self) {
        return nil;
    }
    _title = [decoder decodeObjectForKey:@"title"];
    _author = [decoder decodeObjectForKey:@"author"];
    _pageCount = [decoder decodeIntegerForKey:@"pageCount"];
    return self;
}
{% endhighlight %}


We had a great time trying to figure out why our final values didn't match what we encoded, until we finally realized that some of the setter methods were setting other values in the class! That's where the somewhat maniacal logging came into play. We ended up solving this by using a variant of this approach:

{% highlight objectivec %}
-(id)initWithCoder:(NSCoder *)aDecoder {
    self = [super init];
    _doNotUpdate = YES;
    [self agrianInitWithCoder:aDecoder];
    _doNotUpdate = NO;
    
    return self;
}
{% endhighlight %}

Any of our setter methods that had cascading effects all checked for `_doNotUpdate` before doing any changes.

## Conclusion

I won't go over `NSKeyedArchiver` or `NSKeyedUnarchiver` here. Those classes are very straightforward once we had all the encoding/decoding worked out.

We always strive for Good Code. Clean Code. Code that conforms to all the standards and conventions and unicorns out there. But that doesn't always work out. Sometimes the Right Code is very dirty indeed. So don't feel bad when you end up committing atrocities in the name of deadlines. We've all done it. Some of us even blog about it.
