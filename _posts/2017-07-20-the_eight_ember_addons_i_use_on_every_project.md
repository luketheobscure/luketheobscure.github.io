---
layout: post
title:  "The Eight Ember Addons I Use On Every Project"
date:   2017-07-20 13:58:55
image:
  feature: computer.jpg
tags: [swift, objective-c, ios, coredata, debugging]
description: The depth and breadth of the Ember addon ecosystem can be overwhelming to novice developers. Installing a new addon can feel like a gamble, since you often don’t know what the pitfalls are until after you’ve lived with it in your codebase for a while.
---

[Ember Observer](https://emberobserver.com/) does a good job providing some metrics, but there’s nothing like a referral from someone who’s dealt with an addon firsthand. With this in mind here’s my list of addons that, without exception, I install on every single Ember project I work on.

_Crossposted to [Medium](https://medium.com/@lukedeniston/the-eight-ember-addons-i-use-on-every-project-8393bea3c96f)._

### 1. [ember-power-select](http://www.ember-power-select.com/)

I’ve yet to work on a project where I didn’t need to use a select menu. While the built in Ember helpers do a fine job with the basics, `ember-power-select` blows it away in terms of features and composability. It’s elegantly architectured so that it works well out of the box, but overriding any aspect is simple. Search, multi-select, and promise support are just the beginning. There’s a Bootstrap theme and Material theme, and any of the specifics can even be overridden with SASS variables. It’s very actively developed, issues are usually promptly addressed, and pull requests are quite welcome.

The developer also has the distinction of having given [the most entertaining tech talk](https://www.youtube.com/watch?v=MpFudGJn2J0) I've ever seen.

### 2. [ember-cli-template-lint](https://github.com/rwjblue/ember-cli-template-lint) / [ember-template-lint](https://github.com/rwjblue/ember-template-lint)

There’s less to say about ember-cli-template-lint simply because it’s a “set it and forget it” sort of addon. It’s so simple and intuitive I usually forget to install it until an issue pops up and I’m left wondering why template-lint didn’t catch it (at which point I facepalm and get it installed). I wouldn’t be surprised if this becomes one of the default addons that ships with ember-cli at some point in the future.

This does everything from indentation checking, bare strings checks (so you don’t forget to translate something), to phishing protection with the `[lint-rel-noopener](https://github.com/rwjblue/ember-template-lint#link-rel-noopener)` rule. It’s dead simple to turn rules on and off, or even define your own custom rule.

### 3. [ember-cli-document-title](https://github.com/kimroen/ember-cli-document-title)

Not particularly exciting, but no less important. `ember-cli-document-title` makes it dead simple to provide intelligent document titles on a route-by-route basis. You can roll up the titles to provide a nice breadcrumbs-esque document title (like “Home > Products > Widgets”), or provide dynamic segments in your title with data from your models. It may seem unimportant in the age of a gajillion browser tabs, but if you’ve ever looked at your “Back” menu only to see a long list of the same name you know how important accurate document titles can be.

### 4. [ember-concurrency](https://ember-concurrency.com)

Ember-concurrency is hard to summarize, but once you start using it, it completely changes the way you write your code. At it’s heart it exposes a `Task` primitive, which can be invoked like an action or called like a function. A `TaskInstance` can be cancelled, queued or restarted. You can easily access the property's last returned value, as well as its current state.
Consider a simple save action from a form. A naive implementation would simply wire a button up to with something like `{{action 'save'}}`. A slightly more experienced programmer knows to guard against repeated clicks, so puts in some sort of logic to prevent repeated calls to save. An even more experienced programmer would know to also update the UI to give the user feedback. This is trivial with ember-concurrency. A basic save property might look like this:

```javascript
saveModel: task(function * () {
  try {
    yield this.get('model').save()
  } catch(e) {
    // Handle failure
  }  
}).drop()
```

While your template looks like this:

{% highlight html %}
{% raw %}
<button onclick={{action (perform saveModel) disabled={{saveModel.isRunning}}>
  Save
</button>
{% endraw %}
{% endhighlight %}

### 5. [ember-cli-code-coverage](https://github.com/kategengler/ember-cli-code-coverage) / [ember-cli-blanket](https://github.com/sglanzer/ember-cli-blanket)

For the uninitiated, code coverage is the percentage of your code that’s hit while your tests are running. While it doesn’t give insight into the depth or quality of your tests, having an overview of the _breadth_ of your tests can be crucial. Most CI solutions support failing the build if coverage drops below a certain metric, or drops from one commit to the next. These addons also make it easy to see which lines aren’t getting hit, and give you a file-by-file percentage so you can see which areas of your application need better coverage.

`ember-cli-blanket` has been deprecated in favor of `ember-cli-code-coverage`, but sadly there's [an issue](https://github.com/kategengler/ember-cli-code-coverage/issues/55) with using `ember-cli-code-coverage` with CoffeeScript, so sadly there's a few projects of mine that are stuck with `ember-cli-blanket` (even though that has [an issue](https://github.com/sglanzer/ember-cli-blanket/issues/162) with > QUnit 2.2.2

### 6. [ember-cli-deploy](http://ember-cli-deploy.com/)

This addon is dlds down *amazing*. While there's quite a bit of decisions to be made in the setup, the documentation is excellent, and there's a myriad of plugins available to support most configurations. It even supports the ability to instantly activate or rollback to a specific revision. Deployments are stressful times for everyone else, but those of us in `ember-cli` can rest easy thanks to the hard work put in by the `ember-cli-deploy` team.

Moving towards true "Continuous Delivery" has been my goal for the last year or two, and thanks to good code coverage metrics and pain-free deploys I'm closer than ever to pulling the trigger on having automatic push-to-production every time we merge to master (I'm not quite there yet, but my projects with good code coverage have gone from monthly deploys to daily). I should mention that [Yarn](https://yarnpkg.com/en/) is also a piece of that puzzle (consistent dependency installations), although we technically had the same functionality with [npm-shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap), but shrinkwrap was a nightmare to work with.


### 7. [ember-cli-mirage](http://www.ember-cli-mirage.com/)

Mirage is a key part of writing acceptance tests. It's essentially a mock server that can run during your tests, intercepting requests and spitting back fixture data. Mirage takes things a step further by introducing models, serializers, and a persistence layer on top of the route configuration. Mirage is such a _de facto_ part of my workflow, I honestly don't know how to write a complex acceptance test without it. The author was on a [recent episode of Ember Weekend](http://emberweekend.com/episodes/not-a-mirage-anymore) where he talked about the future of Ember Mirage. He's got some exciting things coming down the pike, including automatic discovery of your Ember models, which will reduce even further the boilerplate needed to write an acceptance test. It sounds like when it's he's done with it, the only setup needed to write an entire [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) acceptance test will be a single `this.resource('foo-model')` entry in a configuration file!

### 8. [ember-composable-helpers](https://github.com/DockYard/ember-composable-helpers)

This is a handy little collection of template helpers that can alleviate a lot of the boilerplate that can sometimes clutter up your components or controllers. Consider a typical controller with a a property like `newModels: computed.filterBy('model.isNew')` and a template like:

{% highlight html %}
{% raw %}
{{#each newModel as |foo|}}
  {{foo.title}}
{{/each}}
{% endraw %}
{% endhighlight %}

Not only is the `newModels` property essentially boilerplate, but we've lost the context a little bit. Imagine a lazy developer who instead names that property something like `newM` or even worse `models` (I've seen it happen). That can make it difficult to reason about what's going on in your template without constantly checking the underlying controller. With `ember-composable-helpers` we can get rid of the property. The helpers were also designed with "composability" in mind, so you can mix and match to suit your needs:

{% highlight html %}
{% raw %}
{{#each (sort-by "title" (filter-by "isNew" model)) as |foo|}}
{% endraw %}
{% endhighlight %}

There's a lot of helpers available, including some neat action and math helpers. There's a seperate repo for [string helpers](https://github.com/romulomachado/ember-cli-string-helpers). The helpers can also be opted into via your configuration `ember-cli-build.js` so if your only interested in one or two you don't have to include the whole library in your app.

## Honorable Mentions

It was hard to trim the list down to just the addons that I use on *every* project. Here's a few honorable mentions that are worth checking out, but may not be necessary given the requirements of your application:

* [ember-wormhole](https://github.com/yapplabs/ember-wormhole): For when you need to render something outside of the DOM element of you template.
* [liquid-fire](http://ember-animation.github.io/liquid-fire/): Easy animations, including on a per-route basis.
* [ember-feature-flags](https://github.com/kategengler/ember-feature-flags): Easiy turn on or off parts of your application. Includes test helpers for toggling them on the fly.
* [ember-cli-sass](https://github.com/aexmachina/ember-cli-sass): Despite all the advances in CSS, I still prefer using a preprocessor like [SASS](http://sass-lang.com/). This addon makes it simple.
* [ember-component-css](https://github.com/ebryn/ember-component-css): Easily scope your styles to a component. Only not in the top 8 because I forgot it while I was writing this article.
* [ember-percy](https://percy.io/): Visual regression testing! They've got a nice free tier to try it out.
* [ember-a11y](https://github.com/ember-a11y/ember-a11y): Accesibility helpers. Dead simple to make sure your application works with screen readers.
* [ember-cp-validations](http://offirgolan.github.io/ember-cp-validations/): Powerful validation library driven by computed properties.
* [ember-simple-auth](http://ember-simple-auth.com/): If you do any kind of authentication, you should check this out.
* [ember-sinon](https://github.com/csantero/ember-sinon): Nice shim for [Sinon](http://sinonjs.org/) for spies, stubs and mocks.

_The image "[Memory](https://www.flickr.com/photos/bogenfreund/15610487302)" by Alexander Boden is licensed under CC BY 2.0_
