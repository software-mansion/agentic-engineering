const aiResultPath = process.argv[2];
if (!aiResultPath) {
  console.error("Usage: post-slack.mts <ai_result_json>");
  process.exit(1);
}

const raw = JSON.parse(await Bun.file(aiResultPath).text());

if (typeof raw !== "object" || raw === null) {
  console.error("[changelog entry] Expected object, got", typeof raw);
  process.exit(1);
}
if (typeof raw.slackMessage !== "string" || raw.slackMessage.trim() === "") {
  console.error(
    "[changelog entry] Missing or empty 'slackMessage' field. Full result:",
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
    message: raw.slackMessage.trim(),
  }),
});

console.log(`[slack] HTTP status: ${response.status}`);

if (!response.ok) {
  const responseText = await response.text();
  console.error(
    `[slack] Webhook request failed with status ${response.status}. Response body: ${responseText}`,
  );
  process.exit(1);
}
