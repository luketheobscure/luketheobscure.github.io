---
layout: post
title:  "How To Write A Really, *Really* Ambitious SPA in 2019"
date:   2019-08-11 13:58:55
image:
  feature: blueprint.jpg
tags: [ember, yarn, ginormous]
description: Using ember-engines and yarn workspaces to maximize happiness.
---

Over the past few years a few technologies have matured to the point where writing a really, *really* ambitious (enterprise!) web application is pretty darn easy. Specifically:

  - Yarn workspaces, and their support across the greater javascript ecosystem
  - Ember.js and its embrace of native classes
  - Ember Engines, which brings lazy loading and code encapsulation

This is not a guide on how to get started with any of these things. This is not a "Hello World!" or "TODO" example. This article is a brain dump of how to architect a *ginormous* single page web application, while still maintaining developer ergonomics and customer happiness. 

As a general rule of thumb, if your app has less than 100 routes, you don't need to do this. Just use vanilla Ember/React/Vue whatever and you'll be (mostly) just fine. But a few hundred routes? Or a few thousand? Then keep reading.

## Obligatory Background Section

I've been doing web dev for over a decade, with the past 5 or so years mostly working with Ember. I've tried a few different approaches: monoliths, microservices, serverless, macroservices, monoserviceless. Some of those worked well, and some of them didn't. Some of those are words I just made up. Each approach has its pros and cons, but after years of experimenting we've finally found the *One True Architecture* (at least for us).

We started with a monolithic front end that talked to microservice back ends. That was **awful** (for the front end).

Then we made a bunch of separate Ember apps that mirrored our back end architecture. We made some internal addons for shared code and to provide a cohesive user experience. That was **better**. 

Then we started making separate engines instead of separate apps, so we could share services and avoid a hard refresh as users navigated features. This turned out to be **much worse** for developers, but **much better** for customers. We would get into situations where a bug might need pull requests in the internal addon, then the engine (bumping the internal addon version), then the host app (updating the engine version). Three pull requests for one bug is just not conducive for developer happiness (or engineering velocity). But from the customers perspective, navigating between features was much faster, now that the entire page didn't need to rerender.

## Yarn Workspaces Are So Amazing, I'm Serious Right Now You Guys

Yarn workspaces solve these issues perfectly. You can easily have a host application, a bunch of engines, and some shared addons in a single repo. Getting started is straightforward. Just add a `package.json` in the root that looks like this:

```json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```
Then make a file structure that looks like this

```
root
└─ packages
   ├─ host-app
   ├─ engine-1
   ├─ engine-2
   └─ shared-addon
```

Now if the `host-app` declares `engine-1` as a dependency, it will just bring in the folder in your repo (as long as the version in `engine-1/package.json` matches what you've declared as a dependency). What's more, live reload will detect if you've made changes in the engine and reload the host app with your new code! Lazy loading of engines makes sure you're not bloating the initial payload, and the code encapsulation and isolation you get means that you can upgrade and refactor one engine without being afraid that you're breaking features elsewhere.

If you're new to Ember Engines, be sure to go read the [excellent guide](http://ember-engines.com/guide/). Read it thoroughly, don't just skim it like I did. You might lose half a day wondering why your tests aren't working and then you'll realize that you're lazily loading the engine and you didn't read [the section about that](http://ember-engines.com/guide/testing#testingforlazyengines) in the guide. Not that I did that...

## Stupid Workspace Tricks<small><sup>[1](#footnote1)</sup></small>

And by stupid I mean **AMAZING**. Some tips and tricks I found whle working with engines.

### Shared Config Files

One of the packages we added to our workspace is called `shared-files`. It's where we store things like ESLint and TypeScript configurations. This makes it easy to keep things consistent across packages. Most of our `.eslintrc.js` files now just look like this:

```
module.exports = require("shared-files/eslint.config.js");
```

And our `tsconfig.json` files looks like:

```
{
  "extends": "../shared-files/tsconfig.json",
  "compilerOptions": {
    // etc...
  }
}
```

### Global Resolutions

You'll want some dependencies to be on the same version for all your packages. This is especially true for things like Ember Engines, since the host and the engine will need to updated in lockstep. Simply add a resolutions block to the root `package.json` file:

```
{
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "resolutions": {
    "**/ember-engines": "0.8.2"
  }
}
```

Then your individual packages can simply declare the dependency like so:

```
"ember-engines": "*"
```

### Sharing Code With Other Repos

As we migrate our codebase to this New World Order<sup>[2](#footnote2)</sup>, we needed a way to share some business logic with our older standalone Ember apps. The solution was to make a new package in the workspace specifically for sharing logic in and out of the workspace. Since each package in your workspace is still a normal package, you can publish any individual package to a registry to be consumed in other applications. 

This comes with one significant caveat. Since we're not publishing our other packages we can't refer to them inside of our new published package. That means the other _Stupid Workspace Tricks_ won't work here.

<small><a name="footnote1">1</a>: In case you don't get [the reference](https://www.youtube.com/watch?v=D8zEBRRw1oI).</small><br>
<small><a name="footnote2">2</a>: This is, of course, a reference to [Magic: The Gathering](https://mtg.gamepedia.com/New_World_Order).</small>


Header image by <a href="https://pixabay.com/users/Wokandapix-614097/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=964629">Wokandapix</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=964629">Pixabay</a>.