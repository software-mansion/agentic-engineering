const raw = JSON.parse(await Bun.file("/tmp/ai-result.json").text());

if (typeof raw !== "object" || raw === null) {
  console.error("[ai-result.json] Expected object, got", typeof raw);
  process.exit(1);
}
if (typeof raw.entry !== "string" || raw.entry.trim() === "") {
  console.error(
    "[ai-result.json] Missing or empty 'entry' field. Full result:",
    JSON.stringify(raw),
  );
  process.exit(1);
}

const webhookUrl = process.env.SLACK_WEBHOOK_URL;
if (!webhookUrl) {
  console.error("[env] SLACK_WEBHOOK_URL not set");
  process.exit(1);
}

const response = await fetch(webhookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    date: process.env.CHANGELOG_DATE ?? "",
    message: raw.entry,
  }),
});

console.log(`[slack] HTTP status: ${response.status}`);
