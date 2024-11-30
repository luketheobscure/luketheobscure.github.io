---
layout: post
title: Advent of Code with Deno and TypeScript
description: In which I try Deno, and like it a lot
image:
  feature: colorful-toy-dinosaurs-on-yellow-surface.jpg
---

There's something about [Advent of Code](https://adventofcode.com/) (AoC) that makes me feel that excitement I felt when I first started coding. I generally get about halfway through and hit a point where the time it takes to do the puzzles exceeds the meager amount of free time I have. In the past I've tried tackling it in TypeScript, Rust and Kotlin. This year I'm not feeling particularly ambitious so I've decided to use TypeScript again, but I'm swapping out Node for [Deno](https://deno.com/). I spent a few hours over my Thanksgiving break kicking the tires on Deno so I can hit the ground running come December.

While there are some [interesting tools](https://deno.land/x/advent_of_code@v0.1.2) built specifically for Deno + AoC, I really wanted to see what you get out of the box with Deno. [Installing Deno](https://docs.deno.com/runtime/getting_started/installation/) is as simple as a curl command or `brew install deno`, and I started my project with `deno init advent-of-code-2024` (although I'm not sure that step was even necessary!). With Deno, TypeScript is a first class language, so there's no separate compile or bundle step. You can simply write some TypeScript and Deno will execute it. There's no need to install TypeScript, Webpack, Babel, npm, or anything else. It "just works".

I can't stress enough how refreshing this is. The year I tried AoC with Kotlin, I spent as much time messing with Gradle configuration files as I did writing actual Kotlin code. The last time I tried it in TypeScript, I opted to use a boilerplate project I found instead of trying to set it up from scratch so that I wouldn't waste time any time. With Deno, I was able to get right to work.

[Fast feedback loops](./improve-everything) are important to me when I'm developing, especially when tackling something like AoC. I started with the official [Deno VS Code extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) for basic language support like autocomplete and type checking. I then set up two launch configurations.

The first one will watch the current file and execute it every time you make a change. This is useful for the first part of an AoC task that usually take a small input that you then verify. I wasn't able to get it to work with breakpoints, but for inspecting the running code I just used the other launch config.

```json
{
    "type": "node",
    "request": "launch",
    "name": "Deno Watch",
    "program": "${file}",
    "runtimeExecutable": "deno",
    "runtimeArgs": [
        "run",
        "--unstable",
        "--watch",
        "--allow-all"
    ],
    "cwd": "${workspaceFolder}",
    "console": "integratedTerminal",
    "attachSimplePort": 9229
}
```

This next configuration simply runs the current file with breakpoint debugging support. In the past AoC challenges could get quite taxing from a memory and CPU standpoint, so a watch process wouldn't make much sense. With this setup, running my code is a simple `F5` away.

```json
{
    "request": "launch",
    "name": "Deno Debug",
    "type": "node",
    "program": "${file}",
    "cwd": "${workspaceFolder}",
    "runtimeExecutable": "deno",
    "runtimeArgs": [
        "run",
        "--unstable",
        "--inspect-wait",
        "--allow-all"
    ],
    "attachSimplePort": 9229
}
```

Deno comes with a few other quality of life improvements over Node. Importing dependency doesn't require a manifest (unless you want to). Here's some examples from the Deno docs:

```typescript
import { camelCase } from "jsr:@luca/cases@1.0.0";
import { say } from "npm:cowsay@1.6.0";
import { pascalCase } from "https://deno.land/x/case/mod.ts";
```

Come at me, Advent of Code. I'm ready.

![Obligatory AI generated image of a dinosaur during christmas](/images/deno-ai.webp)

