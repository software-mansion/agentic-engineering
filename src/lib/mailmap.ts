import { readFile } from "node:fs/promises";

export type MailmapProfile = {
  github: string;
  name: string;
};

const mailmapPath = new URL("../../.mailmap", import.meta.url);

const getGithubFromEmail = (email: string) =>
  email
    .toLowerCase()
    .match(/^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/)?.[1];

type MailmapEntry = MailmapProfile & {
  emails: string[];
};

const getMailmapLineError = (lineNumber: number, message: string) =>
  new Error(`Invalid .mailmap entry on line ${lineNumber}: ${message}`);

const parseMailmapLine = (
  line: string,
  lineNumber: number,
): MailmapEntry | null => {
  const trimmedLine = line.trim();

  if (!trimmedLine || trimmedLine.startsWith("#")) {
    return null;
  }

  const emails = Array.from(trimmedLine.matchAll(/<([^>]+)>/g), (match) =>
    match[1].toLowerCase(),
  );
  const [canonicalEmail, ...aliasEmails] = emails;

  if (!canonicalEmail) {
    throw getMailmapLineError(
      lineNumber,
      "expected a canonical email address.",
    );
  }

  const github = getGithubFromEmail(canonicalEmail);

  if (!github) {
    throw getMailmapLineError(
      lineNumber,
      `canonical email "${canonicalEmail}" must be a GitHub noreply address.`,
    );
  }

  const name = trimmedLine.slice(0, trimmedLine.indexOf("<")).trim();

  if (!name) {
    throw getMailmapLineError(lineNumber, "expected a canonical name.");
  }

  return {
    github,
    name,
    emails: [canonicalEmail, ...aliasEmails],
  };
};

const parseMailmap = (mailmap: string) =>
  mailmap.split("\n").flatMap((line, index) => {
    const profile = parseMailmapLine(line, index + 1);
    return profile ? [profile] : [];
  });

export class Mailmap {
  static async load() {
    const entries = parseMailmap(await readFile(mailmapPath, "utf8"));
    return new Mailmap(entries);
  }

  readonly #emailGithubMap: Record<string, string>;
  readonly #profileMap: Record<string, MailmapProfile>;

  private constructor(entries: MailmapEntry[]) {
    this.#emailGithubMap = Object.fromEntries(
      entries.flatMap(({ emails, github }) =>
        emails.map((email) => [email, github]),
      ),
    );
    this.#profileMap = Object.fromEntries(
      entries.map(({ github, name }) => [github, { github, name }]),
    );
  }

  getGithubForEmail(email: string) {
    const normalizedEmail = email.toLowerCase();

    // Keep unmapped GitHub noreply commit authors attributable by username.
    const github =
      this.#emailGithubMap[normalizedEmail] ??
      getGithubFromEmail(normalizedEmail);

    if (!github) {
      throw new Error(
        `No GitHub username found for email "${email}". Add a .mailmap entry like: Name <github@users.noreply.github.com> <${email}>.`,
      );
    }

    return github;
  }

  getProfile(github: string) {
    const profile = this.#profileMap[github.toLowerCase()];

    if (!profile) {
      throw new Error(
        `No .mailmap profile found for GitHub user "${github}". Add a .mailmap entry like: Name <${github}@users.noreply.github.com>.`,
      );
    }

    return profile;
  }
}
