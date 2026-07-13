#!/usr/bin/env bun

import path from "node:path";
import { parseLinksCsv } from "../src/lib/links";

const LINKS_CSV_PATH = path.join(process.cwd(), "src", "data", "links.csv");
const REPORT_PATH = process.argv[2];
const CONCURRENCY = 10;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;
const DEAD_STATUSES = new Set([404, 410]);
const ACTIVE_STATUSES = new Set([401, 403, 405, 429]);

type LinkResult =
  | { url: string; kind: "active"; status: number }
  | { url: string; kind: "dead"; status: number }
  | { url: string; kind: "inconclusive"; reason: string; status?: number };

type LinkReport = {
  checked: number;
  active: number;
  dead: Array<{ url: string; status: number }>;
  inconclusive: Array<{ url: string; reason: string; status?: number }>;
};

async function main(): Promise<void> {
  const currentText = await Bun.file(LINKS_CSV_PATH).text();
  const records = parseLinksCsv(currentText);
  const results = await mapWithConcurrency(
    records.map((record) => record.url),
    CONCURRENCY,
    checkLink,
  );

  const report: LinkReport = {
    checked: records.length,
    active: results.filter((result) => result.kind === "active").length,
    dead: results
      .filter((result) => result.kind === "dead")
      .map(({ url, status }) => ({ url, status })),
    inconclusive: results
      .filter((result) => result.kind === "inconclusive")
      .map(({ url, reason, status }) => ({ url, reason, status })),
  };

  if (REPORT_PATH) {
    await Bun.write(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  }

  console.log(
    `Checked ${report.checked} links: ${report.active} active, ${report.dead.length} dead, ${report.inconclusive.length} inconclusive.`,
  );

  for (const link of report.dead) {
    console.error(`Dead (${link.status}): ${link.url}`);
  }

  for (const link of report.inconclusive) {
    console.warn(
      `Inconclusive${link.status ? ` (${link.status})` : ""}: ${link.url} — ${link.reason}`,
    );
  }
}

async function checkLink(url: string): Promise<LinkResult> {
  let lastResult: LinkResult | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    lastResult = await checkLinkOnce(url);

    if (lastResult.kind === "active") {
      return lastResult;
    }

    if (attempt < MAX_ATTEMPTS) {
      await Bun.sleep(attempt * 1_000);
    }
  }

  return (
    lastResult ?? {
      url,
      kind: "inconclusive",
      reason: "No check result was produced",
    }
  );
}

async function checkLinkOnce(url: string): Promise<LinkResult> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        "user-agent":
          "software-mansion-link-checker/1.0 (+https://swmansion.com)",
      },
    });

    await response.body?.cancel();

    if (response.ok || ACTIVE_STATUSES.has(response.status)) {
      return { url, kind: "active", status: response.status };
    }

    if (DEAD_STATUSES.has(response.status)) {
      return { url, kind: "dead", status: response.status };
    }

    return {
      url,
      kind: "inconclusive",
      status: response.status,
      reason: response.statusText || "Unexpected HTTP response",
    };
  } catch (error) {
    return {
      url,
      kind: "inconclusive",
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await mapper(values[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, worker),
  );

  return results;
}

await main();
