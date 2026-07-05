import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function loadLocalEnv() {
  let file;

  try {
    file = await readFile(path.join(rootDir, ".env"), "utf8");
  } catch {
    return;
  }

  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function richTextToPlainText(richText = []) {
  return richText.map((item) => item.plain_text || "").join("");
}

async function notionRequest(endpoint, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": process.env.NOTION_VERSION || "2022-06-28",
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erreur Notion ${response.status} sur ${endpoint}: ${body}`);
  }

  return response.json();
}

async function main() {
  await loadLocalEnv();

  if (!process.env.NOTION_TOKEN) {
    throw new Error("Configuration manquante dans .env: NOTION_TOKEN");
  }

  const databases = [];
  let cursor;

  do {
    const body = {
      filter: { property: "object", value: "database" },
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {})
    };

    const data = await notionRequest("/search", {
      method: "POST",
      body: JSON.stringify(body)
    });

    databases.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  if (databases.length === 0) {
    console.log("Aucune base visible par cette intégration.");
    return;
  }

  for (const database of databases) {
    const title = richTextToPlainText(database.title) || "Sans titre";
    console.log(`${title}\n  ${database.id}\n`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
