---
title: Some words about models
description: A concise comparison of popular coding models, including free-access options, strengths, weaknesses, and cost tradeoffs.
---

Choose models by reliability, cost, and workflow fit, then benchmark them on your own real tasks.

## Where to access free models

- **ChatGPT Codex**: Available on the free plan until April 2nd, 2026.

- **[Amp](https://ampcode.com/)**: Free usage of $10/day is provided if you signed up before February 10th, 2026. Otherwise, pricey.

- **[OpenCode Zen](https://opencode.ai/docs/zen/)**: They always have some Chinese or xAI model available for free, though conversations are sent to vendors as training data. All models are hosted in the USA.

## Frontier model comparison

- **Claude Opus**
  - Decent creativity, can present with an engaging personality.
  - Tends not to read enough context, so it can hallucinate.
  - RL-trained heavily to follow instructions and perform tool calls.
  - Very expensive per token. Use short threads because cost grows quickly as thread length increases and cache gets pruned over time.

- **GPT**
  - Workhorse, RL-trained to gather a lot of context before answering, so slower but tends to generate the most "in-place" code.
  - Cheapest cost per token.
  - Codex variants have great compaction algorithms, and they can reliably work over long threads.

- **Gemini**
  - Looks very creative and brilliant, but the models can be unreliable (they tend to ignore instructions).

- **Chinese models**
  - MiniMax, Kimi, Qwen, etc. Very cheap. MiniMax M2.5 is very close to the frontier.
  - Smaller versions are often open-source.
  - Be careful to use US/EU inference providers only; check out [OpenCode Zen](https://opencode.ai/docs/zen/), as they host all models in the USA; avoid routing sensitive work through providers in other jurisdictions.
