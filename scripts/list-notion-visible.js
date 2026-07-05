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

function titleForObject(object) {
  if (object.object === "database") return richTextToPlainText(object.title) || "Sans titre";
  if (object.object === "page") {
    const titleProperty = Object.values(object.properties || {}).find((property) => property.type === "title");
    return richTextToPlainText(titleProperty?.title || []) || "Sans titre";
  }
  return "Sans titre";
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

  const objects = [];
  let cursor;

  do {
    const data = await notionRequest("/search", {
      method: "POST",
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) })
    });

    objects.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  if (objects.length === 0) {
    console.log("Aucun objet visible par cette intégration.");
    return;
  }

  for (const object of objects) {
    console.log(`${object.object.toUpperCase()} - ${titleForObject(object)}\n  ${object.id}\n  ${object.url || ""}\n`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
