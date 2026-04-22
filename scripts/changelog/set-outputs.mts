import { readFileSync, appendFileSync } from "fs";

const raw = JSON.parse(readFileSync("/tmp/ai-result.json", "utf-8"));

if (typeof raw !== "object" || raw === null) {
  console.error("[ai-result.json] Expected object, got", typeof raw);
  process.exit(1);
}
if (typeof raw.trivial !== "boolean") {
  console.error(
    "[ai-result.json] Missing or non-boolean 'trivial' field. Full result:",
    JSON.stringify(raw),
  );
  process.exit(1);
}

const outputFile = process.env.GITHUB_OUTPUT;
if (!outputFile) {
  console.error("[env] GITHUB_OUTPUT not set");
  process.exit(1);
}

const trivial = raw.trivial;
appendFileSync(outputFile, `trivial=${trivial}\n`);
console.log(`trivial=${trivial}`);
