---
layout: post
title:  "Ember + WebAssembly Just Got Way Easier"
date:   2018-07-25 13:58:55
image:
  feature: computer2.jpg
tags: [ember, wasm]
description: WebAssembly is probably the most exciting and frustrating technology to come around in a while. Ember now makes it easy.
---

_Crossposted to [Medium](https://medium.com/@lukedeniston/ember-webassembly-just-got-way-easier-1e4ec6ca40ab)._

## TL;DR

1. Install [ember-auto-import](https://github.com/ef4/ember-auto-import)
2. Import Wasm modules with `import('path/to/wasm')`
3. That’s all the steps. You’re done!

## Background + Complaining


The promise of WebAssembly is awesome: true write once, run anywhere technology, that runs in a VM that users already have (a browser!). But as is often the case, the reality is not quite that rosy. The only officially supported types are all numeric (as in you can't pass in a string or get one back from a Wasm module). The process for loading Wasm modules is not as simple as many how-to's would have you believe. And the debugging story is still mostly non-existent.

To fill in the gaps there's a handful of community solutions that make things easier. The [Rust and WebAssembly](https://rustwasm.github.io/) project aims to "facilitate high-level interactions between wasm modules and javascript" (via the [wasm-bindgen](https://rustwasm.github.io/wasm-bindgen/) package). In other words, it generates wrapper code that let's you pass in and receive non-numeric types to your Wasm modules. [Wasm-pack](https://github.com/rustwasm/wasm-pack) makes it dead simple to build and publish Rust code to easily consumed NPM packages.

[Webpack](https://webpack.js.org/) recently added support for importing Wasm modules like those generated by wasm-pack. So instead of doing some sort of dance with `WebAssembly.instantiateStreaming(fetch('foo'), { imports...`, webpack users can just call `import('foo')` and work with the result just like any other imported module (albeit an asynchronous one).

## So what does that have to do with Ember?

[Edward Faulkner](https://eaf4.com/) has been quietly working on a little package called [ember-auto-import](https://github.com/ef4/ember-auto-import) as a solution for easily importing node modules into Ember apps. He recently landed a patch that allows the use of dynamic `import(...)` statements. Since ember-auto-import uses Webpack under the hood, this happens to make using WASM modules dead simple inside an Ember app!

I made a simple Ember app to showcase how easy this is. [Here's the relevant commit](https://github.com/luketheobscure/wasm-example/commit/07477bc2b02ace0e6c347a3f9729d7284ca1be9d) where I import a Wasm module.

The only caveat I can think of is you need to make sure all the generated assets get deployed. Since it's not javascript, it obviously can't get rolled up into you `application.js` or `vendor.js` files. Normal `ember build` commands generate all the correct files, just double check your deploy scripts. 🐹

_The image "[Cpc464.computer](https://commons.wikimedia.org/wiki/File:Cpc464.computer.750pix.jpg#file)" by Arpingstone is licensed under CC BY 2.0_
