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
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function richTextToPlainText(richText = []) {
  return richText.map((item) => item.plain_text || "").join("");
}

function titleForPage(page) {
  const titleProperty = Object.values(page.properties || {}).find((property) => property.type === "title");
  return richTextToPlainText(titleProperty?.title || []) || "Sans titre";
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
  if (!process.env.NOTION_TOKEN) throw new Error("Configuration manquante dans .env: NOTION_TOKEN");

  const pages = [];
  let cursor;

  do {
    const data = await notionRequest("/search", {
      method: "POST",
      body: JSON.stringify({
        filter: { property: "object", value: "page" },
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {})
      })
    });
    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  const groups = new Map();
  for (const page of pages) {
    const parent = page.parent;
    const key = parent?.database_id || parent?.page_id || parent?.workspace || "parent inconnu";
    const group = groups.get(key) || { parent, pages: [] };
    group.pages.push(titleForPage(page));
    groups.set(key, group);
  }

  for (const [id, group] of groups.entries()) {
    console.log(`${group.parent?.type || "unknown"}: ${id}`);
    console.log(`  ${group.pages.length} page(s): ${group.pages.slice(0, 12).join(", ")}${group.pages.length > 12 ? ", ..." : ""}\n`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
