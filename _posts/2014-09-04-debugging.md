---
layout: post
title:  "A Debugging Story"
date:   2014-09-04 13:58:55
image:
  feature: first_bug.jpg
tags: [swift, objective-c, ios, coredata, debugging]
description: Debugging is arguably the most important skill in a programmers toolkit, yet it's almost never talked about in technical interviews, and it barely gets a mention in most computer science programs.
---

Here's a little story about an elusive Swift/CoreData bug I came across and how I got to the bottom of things.

## Green, Red, Refactor?

I've been working on a small side project in Swift and I just got around to writing some unit tests. Up until this point it has mostly been proof-of-concept, so the code was pretty rough and I was ready to start cleaning it up. One technique I used throughout my `NSManagedObject` classes looked something like this:

{% highlight swift %}
class func userWithUsername(username: String) -> User {
	var user : User?
	let request = NSFetchRequest()
	request.entity = NSEntityDescription.entityForName("User", inManagedObjectContext: CoreDataStack.sharedInstance.managedObjectContext)
	request.predicate = NSPredicate(format: "username = '\(username)'")
	user = CoreDataStack.sharedInstance.managedObjectContext.executeFetchRequest(request, error: nil).last as? User

	if user == nil {
		user =  NSEntityDescription.insertNewObjectForEntityForName("User", inManagedObjectContext: CoreDataStack.sharedInstance.managedObjectContext) as? User
		user?.username = username
	}

	return user!;
}
{% endhighlight %}

This function will give me the `User` with the given `username`, or if one doesn't exist it creates it. I know this code is working fine, but when I write a unit test it faults on the last line, reporting that `user` was still `nil`! But how could that be?

## Isolate

The first step I usually take in debugging is *isolation*: remove as many external pieces as I can so I'm working with the minimum set of variables within the system.

The function above is not particularly well written, as it depends on `CoreDataStack.sharedInstance` to work properly. It would be far better to implement [dependency injection](http://en.wikipedia.org/wiki/Dependency_injection) so I could pass in an `NSManagedObjectContext`. I'd read a bit about race conditions causing problems with SQLite backed stores in unit tests, so I implemented a new `NSInMemoryStoreType` persistent store for my tests and refactured the function under test a bit. My new function signature looked like this:

{% highlight swift %}
class func userWithUsername(username: String, context: NSManagedObjectContext = CoreDataStack.sharedInstance.managedObjectContext) -> User
{% endhighlight %}

I can now pass in an `NSManagedObjectContext` if I want to, or I can rely on the default one provided by my `CoreDataStack.sharedInstance`. I patted myself on the back and fired off my tests... Only to have them fail in the exact same way.

## Inspect

Another important part of debugging is *inspection*: getting good information about what's going in your sysyem. (Hey, another "I" word! I sense a theme!)

Fortunately CoreData gives us some great inspection tools by the way of [launch arguments](http://nshipster.com/launch-arguments-and-environment-variables/). I set my launch arguments to `-com.apple.CoreData.SQLDebug 3` and run the tests again. I watch the first few CoreData arguments scroll through the debugger as the app launches...then nothing as my tests are fired off. Much headscratching later and I come to the conclusion that `NSInMemoryStoreType` doesn't support the `com.apple.CoreData.SQLDebug` argument (although I wasn't able to find any documentation about this). I ditch the memory store and create a new persistent store just for the tests. Now that I have an actual SQLite database to look at, I find out that my inserts are failing as well as my fetches.

<figure>
	<img src="{{ site.url }}/images/debugger.png">
	<figcaption>Relevant <a href="http://xkcd.com/1163/">XKCD</a></figcaption>
</figure>

## Break It Down

The last technique I used was *breaking it down*: assume nothing, confirm every step in the process. I'm sorry that didn't start with "I". I'm not really big on themes.

I make some headway when I split my insert statement into two:

{% highlight swift %}
let entity = NSEntityDescription.entityForName("User", inManagedObjectContext: context)
user =  User(entity: entity, insertIntoManagedObjectContext: context)
{% endhighlight %}

My inserts are working now, but my fetch requests are failing... But *why*? Why did that fix the insert statement? Why did I only have the problem with tests and not in production? And why isn't my fetch request working?

I break down the fetch request into it's parts so I can inspect it properly (LLDB still isn't working right for me as of XCode 6 beta 6). I finally get to this point:
{% highlight swift %}
user = context.executeFetchRequest(request, error: error).last as? User
{% endhighlight %}
Became:
{% highlight swift %}
let results = context.executeFetchRequest(request, error: error)
user = results.last as? User
{% endhighlight %}

I'm able to confirm that `results` is getting data! I'm pulling records in my fetch request! But `user` still gets set to `nil`!? -cue head pounding on desk-

But then I see it... On closer inspection the results of my fetch request are of type `AppNameTests.User`. When I run the app the same fetch request returns objects of type `AppName.User`. The `as? User` was killing things, since it was not able to cast between `AppNameTests.User` and `AppNameTests.User`!

Now that I knew what to look for, I found [this handy Stack Overflow](http://stackoverflow.com/questions/25242173/i-cant-use-my-core-data-model-in-two-targets-in-a-swift-project) question about using core data models in multiple targets in Swift. I remove the app name namespace I added to the data models, and I add `@objc(User)` to the top of the class and watch all the tests turn green.
