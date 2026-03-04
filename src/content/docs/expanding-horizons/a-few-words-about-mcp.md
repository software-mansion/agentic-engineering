---
title: A few words about MCP
description: When to choose MCP, skills, or plain CLI integrations, with practical tradeoffs around auth, context load, and workflow fit.
---

MCP is a tricky beast, and it was actually hard for us to find a good place for it in this guide.

MCP is a protocol through which AI applications can connect to data sources (local and remote), tools (applications and services), and workflows (specialized subagents).

MCP is often mentioned along with skills - but they’re not the same. Truth is, 99% of problems can be solved equally well through MCPs, skills, or plain CLIs.

One cool property of MCP is that it solves auth - you can easily authenticate to MCP services using API keys or OAuth with great UX provided by your harness. But MCP also has downsides, such as higher context pollution (try it yourself: load GitHub MCP and see how much context is already lost in a fresh thread). Claude Code is experimenting with countermeasures to this problem, but funnily enough, you can also wrap any MCP in a skill (through [mcporter](https://github.com/steipete/mcporter/)).

So to answer the question: when should you use MCP, a skill, or a CLI? If possible, try all three and do whatever works best for you and your agents.
