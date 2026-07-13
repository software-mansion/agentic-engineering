#!/usr/bin/env bun

import { $ } from "bun";
import path from "node:path";

const DOCS_PATH = path.join("src", "content", "docs");
const INDEX_PATH = path.join(process.cwd(), DOCS_PATH, "index.mdx");
const LAST_REVISED_RE = /\*\*Last revised: ([A-Z][a-z]+) (\d{4})\*\*/;
const CHECK_MODE = process.argv.includes("--check");
const MONTH_FORMATTER = new Intl.DateTimeFormat("en", { month: "long" });
const MONTHS = Array.from({ length: 12 }, (_, month) =>
  MONTH_FORMATTER.format(new Date(2000, month, 1)),
);

async function main(): Promise<void> {
  const content = await Bun.file(INDEX_PATH).text();
  const match = content.match(LAST_REVISED_RE);

  if (!match) {
    fail(
      `Could not find "**Last revised: <Month> <Year>**" in ${path.relative(process.cwd(), INDEX_PATH)}. Update the last revised time.`,
    );
  }

  const [, monthName, yearText] = match;
  const month = MONTHS.indexOf(monthName);

  if (month === -1) {
    fail(
      `Invalid last revised month "${monthName}" in ${path.relative(process.cwd(), INDEX_PATH)}. Update the last revised time.`,
    );
  }

  const latestChange = await getLatestBookChangeMonth();
  const year = Number(yearText);
  const latestChangeMonth = latestChange.year * 12 + latestChange.month;
  const lastRevisedMonth = year * 12 + month;

  if (latestChangeMonth > lastRevisedMonth) {
    if (CHECK_MODE) {
      fail(
        `The book contents changed after the last revised month (${monthName} ${yearText}). Review the changes and update the last revised time in ${path.relative(process.cwd(), INDEX_PATH)}, or run "bun lint" to update it automatically.`,
      );
    }

    const latestChangeDate = new Date(latestChange.year, latestChange.month, 1);
    const latestChangeMonthName = MONTH_FORMATTER.format(latestChangeDate);
    const updatedContent = content.replace(
      LAST_REVISED_RE,
      `**Last revised: ${latestChangeMonthName} ${latestChange.year}**`,
    );
    await Bun.write(INDEX_PATH, updatedContent);
  }
}

async function getLatestBookChangeMonth(): Promise<{
  year: number;
  month: number;
}> {
  const workingTreeChanges = await $`git status --porcelain -- ${DOCS_PATH}`
    .quiet()
    .text();

  if (workingTreeChanges.trim()) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }

  const committedAt = await $`git log -1 --format=%cI -- ${DOCS_PATH}`
    .quiet()
    .text();
  const committedMonth = /^(\d{4})-(\d{2})-/.exec(committedAt.trim());

  if (!committedMonth) {
    fail(`Could not determine the latest book content change from Git.`);
  }

  return {
    year: Number(committedMonth[1]),
    month: Number(committedMonth[2]) - 1,
  };
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

await main();
