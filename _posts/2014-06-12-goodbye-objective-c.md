---
layout: post
title:  "A Goodbye Letter to Objective-C"
date:   2014-06-12 13:58:55
image:
  feature: soft-trees.jpg
tags: [swift, objective-c, ios]
description: I’ll never forget my first reaction to Objective-C. It made me angry.

---

I had just been tasked to lead a mobile development team and I needed to pick up Objective-C (and iOS in general) very quickly. I wasn’t too worried since I had made similar transitions in the past without a problem. I assumed this would be even more painless since the more languages you know, the easier it is to learn a new one.

I was wrong.

Objective-C hurt my brain. My internal parser just couldn’t grasp the syntax. So I got mad. “What’s with the square brackets? Why are variables INSIDE the method name!? This is stupid. Why would anyone make a language like this?” But as with all my feelings I stuffed them into a bottle and never thought about them again, and over time something unexpected happened: *I fell in love*.

I grew to love the obscenely long method names with the variables inside of the method (they read like sentences!). I even loved the square brackets (what a perfect visual metaphor for sending a message- they’re the envelope!). I learned the intricacies of the Objective-C runtime and the Foundation frameworks. I was swizzling and introspecting in ways I never thought possible.

But by definition, Objective-C could never be free of C. String concatenation would always be the unsightly `[NSString stringWithFormat@“%@ %@, foo, bar]`. All the good operators were already taken by C, so we were left with having to put an ampersand in front of everything. We would never be able to do a simple `==` to compare. But who needs tuples, when you can pass in pointers, amiright?

And occasionally I would bump my shins against the language. Lack of a generics equivalent meant that to be truly safe, every array loop should implement type checking. No namespaces meant that official guidelines dictated putting a three letter prefix before every class. Not to mention enums like `kCFStreamErrorHTTPSProxyFailureUnexpectedResponseToCONNECTMethod` (yes, that’s [real](https://developer.apple.com/library/mac/documentation/Networking/Reference/CFNetworkErrors/Reference/reference.html#//apple_ref/doc/c_ref/kCFURLErrorNotConnectedToInternet). Objective-C had a beauty to it, but it was marred in many places by things like it’s [gosh darn block syntax](http://goshdarnblocksyntax.com/) (which is the work safe version of that url. The real version doesn’t use “gosh darn” and starts with “f”).

![Introducing Swift]({{ site.url }}/images/Swift.jpg)

When Swift was announced, I was shocked. So much progress had been made in Objective-C over the past year or two that there was no sign of Apple abandoning it. I even felt a little bit betrayed. Here I had become an expert in a language, just in time to see it die.

But there is a season for everything, and Objective-C’s time has passed. My work responsibilities necessitated my brushing up on Ruby, and I remembered my love for it’s conciseness and intuitiveness. It still manages to read like english, despite being terse. Moving from the Ruby world to the Swift world seems fluid… there’s so much overlap that it seems like different accents of the same language. You say `def` I say `func`.

I think in time my love for Objective-C will fade. Dots and parenthesis will replace square brackets, and Objective-C will take it’s place in history as that oddball permutation of Smalltalk tacked on to C. Swift will take over, and any projects or libraries still in Objective-C will be left to the old guard.

But for a while there, Objective-C and I really had something.
