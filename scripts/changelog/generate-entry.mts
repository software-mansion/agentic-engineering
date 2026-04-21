export {};

const patchFile = process.argv[2];
if (!patchFile) {
  console.error("Usage: generate-entry.ts <patch_file>");
  process.exit(1);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("[env] OPENAI_API_KEY not set");
  process.exit(1);
}

const date = process.env.CHANGELOG_DATE;
if (!date) {
  console.error("[env] CHANGELOG_DATE not set");
  process.exit(1);
}

const patch = await Bun.file(patchFile).text();
const systemPrompt = await Bun.file(".github/prompts/changelog.md").text();

const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Date: ${date}\n\n${patch}` },
    ],
  }),
});

if (!response.ok) {
  console.error(`[openai] HTTP ${response.status}: ${await response.text()}`);
  process.exit(1);
}

const body = await response.json();
const content = body?.choices?.[0]?.message?.content;
if (typeof content !== "string") {
  console.error("[openai] Unexpected response shape:", JSON.stringify(body));
  process.exit(1);
}

process.stdout.write(content);
