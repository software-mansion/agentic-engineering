---
title: Threads, context, and caching
---

## From thread to model input

Models are still just glorified autocomplete. What agent harnesses do is structure agent threads as model inputs (i.e., input strings). Almost every existing harness roughly follows the same framework. It’s dead simple:

![](../../../assets/thread-diagram.svg)

You might ask: what is the context window, then? It is just the maximum length of the input string that the model can ingest. Agent harnesses often reduce this window slightly from actual model limits to reserve space for some tail system messages or a compaction prompt.

Now (especially if you’re going to work with Anthropic models), go read this article: [https://ampcode.com/notes/200k-tokens-is-plenty](https://ampcode.com/notes/200k-tokens-is-plenty). The author wrote a great overview of context peculiarities and how models behave as context usage grows. TL;DR: Keep your threads short.

## Prompt caching

TL;DR: Prompt caching is an optimization for LLM APIs that lets the model _reuse previously computed internal context_ (especially the prefix of prompts like system instructions or examples), so repeated similar requests don’t have to be processed from scratch.

- [https://x.com/trq212/status/2024574133011673516?s=12](https://x.com/trq212/status/2024574133011673516?s=12)
- [https://platform.openai.com/docs/guides/prompt-caching](https://platform.openai.com/docs/guides/prompt-caching?utm_source=chatgpt.com)

## Compaction

TL;DR: Compaction extends the effective context length for long-running conversations and tasks by automatically summarizing older context when approaching the context window limit. Compaction keeps the active context focused and performant by replacing stale content with concise summaries.

- [https://platform.claude.com/docs/en/build-with-claude/compaction](https://platform.claude.com/docs/en/build-with-claude/compaction)
- [https://developers.openai.com/api/docs/guides/compaction](https://developers.openai.com/api/docs/guides/compaction)
- [Client-side compaction system prompt used by Pi agent harness](https://github.com/badlogic/pi-mono/blob/380236a003ec7f0e69f54463b0f00b3118d78f3c/packages/coding-agent/src/core/compaction/compaction.ts#L444-L475)
