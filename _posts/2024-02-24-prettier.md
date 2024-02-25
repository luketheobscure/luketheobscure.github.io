---
layout: post
title: "You Probably *Do* Need ESLint-Prettier"
date: 2024-02-24
image:
  feature: prettier-eslint.webp
description: "Fewer moving parts, fewer broken pieces"
---

I read an article today that I disagreed with so strongly that I'm going to temporarily come out of blogging retirement to submit a rebuttal. I'm talking about "[You Probably Don't Need eslint-config-prettier or eslint-plugin-prettier](https://www.joshuakgoldberg.com/blog/you-probably-dont-need-eslint-config-prettier-or-eslint-plugin-prettier/)" by Josh Goldberg who by all accounts is probably a lot smarter than me. But I've been around for a while and _I've seen things you people wouldn't believe_ so it's time to impart some wisdom. Maybe I don't convince you, but hopefully I give you a new way to look at things.

The crux of Josh's article (if you didn't infer it from the title) is that you shouldn't mix ESLint (a linter) and Prettier (a formatter). I think his claims boil down to this:

- Combining the tools is confusing
- Different tasks should use different tools
- Mixing the two adds a performance hit

I'm going to take a quick look at each of these arguments, and then give you one of my own.

## ESLint + Prettier is Confusing?

Ok, he wins this one. Prettier existing as a standalone tool _is_ confusing. Explaining to developers "don't use Prettier directly, use ESLint to apply the Prettier formatting" ad nauseam gets old. I get it.

Josh: 1, Luke: 0

But this could be fixed easily if it's a big deal. I could go fork the Prettier configs and name them "Luke's ESLint Formatter" and all the confusion would go away. Or you could just add a little note in your ```README.md``` explaining not to use Prettier and call it a day.

## Different tasks, different tools

The argument here is that ESLint is a linter and shouldn't be doing formatting. Disagree big time. Look, we put boxes around things and put labels on them. Our brains love that. We're just fancy pattern matchers and if a pattern doesn't exist we invent one. So all those rules that ESLint follows we call _linting_ and the ones that Prettier follows we call _formatting_. Dopamine.

Let's pretend for a minute that these categories don't exist. Let's just say ESLint is a tool that checks for the _correctness_ of code, however we want to define it. We could just as easily call it ESCorrectness, but I'm not suggesting that because it's terrible.

I'll take it one step further. For me, the only difference between a formatter, a linter, and a type checker is that type checkers have a mostly predefined notion of what correct is, whereas linters and formatters will let me tell it that tabs or spaces are right. Here's an example: is `undefined == null` something the linter should care about, or the type checker? 

If I had one tool that did it all I'd be all for it. Fewer moving parts and all that.

So if you're following along at home, we're at Josh: 1, Luke: 1. I really hope I win my own blog post.

## Prettier performance hit

I'm going to call this one a tie. Does Prettier slow down my linter? I have no idea. It always finishes faster than my unit tests, which always finish faster than my integration tests. If linting took 5-10 times a long, it's still finishing before I really need it to, so I'm not really all that worried about it. 

I do care how long it takes to lint a single file though. I'm all about that format-on-save, and I tell everyone on my team to set it up the same way. When we do it that way we almost _never_ have to worry about linting failing. For a single file, I've never seen an ESLint config that took more than a second to rewrite all my sloppy coding, even on the largest files.

We'll split the points. Josh: 1.5, Luke 1.5.

# So you lost your own blog post?

Well... ok, yes. Technically it's a tie.

But here's the thing - I've spent a lot of time trying to improve the _velocity_ of teams. Or more specifically, trying to improve the metric usually called [Lead Time for Changes](https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance). Automated checks like formatting and linting a huge part of making sure that we're not wasting time arguing about spaces or shipping bugs to users. But there's a balance we have to strike.

Here's a real example. I worked on a code base that had the following checks run:

1. Stylelint
2. Prettier
3. ESLint
4. TSLint (this was set up before ESLint could handle typescript)
5. Husky commit lint (as a pre-commit hook)
6. Cypress systems tests
7. Jest unit tests

That's a lot, right? The sad thing is there's even gaps - there's no visual regression testing for catching CSS issues, and there's also no integration tests, just slow and flaky system tests. The way developers would usually work is push up changes, then wait about an hour while Jenkins ran all the checks. Lather, rinse repeat. Recipe for a slow, frustrated development team.

The first thing I did was set up ESLint to take over for TSLint and Prettier. The next thing I did was some developer education around VS Code's "format on save" options, and the ESLint and Stylelint extensions. We removed the Husky pre-commit hook, and instead opted for PR title checks in a Github action (if you've ever had a pre-commit hook reject your "WIP" commit when you're just trying to switch tasks you understand). The result? Lint failures are few and far between, formatting is never an issue on PRs, and increased velocity and happiness.

Projects naturally grow in complexity over time. Simplifying is much harder to do, and only happens with effort. So opting right out of the gate to using two tools when one would do, you're opting into extra complexity. I love the concept of [innovation tokens](https://mcfunley.com/choose-boring-technology), maybe it's to start thinking about complexity tokens in the same way. If you have a finite amount of complexity tokens to spend, where will you spend them?

<iframe width="560" height="315" src="https://www.youtube.com/embed/xp5Zq7oMtEc?si=oAj_Mu-eqvWDgLIE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

---

_AI looking header image generated by AI to the surprise of no one._
