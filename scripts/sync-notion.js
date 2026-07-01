import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { wikiCollections } from "./wiki-collections.js";
import slugify from "../shared/url.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const outputDataDir = path.join(rootDir, "public", "data");
const outputCollectionsDir = path.join(outputDataDir, "collections");

async function loadLocalEnv() {
  let file;

  try {
    file = await readFile(envPath, "utf8");
  } catch {
    return;
  }

  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['\"]|['\"]$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function requireConfig() {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("Configuration manquante dans .env: NOTION_TOKEN");
  }

  const configuredCollections = wikiCollections.filter((collection) => process.env[collection.envVar]);

  if (configuredCollections.length === 0) {
    throw new Error("Configuration manquante dans .env: renseigne au moins une variable NOTION_DATABASE_*");
  }

  return configuredCollections;
}

function richTextToPlainText(richText = []) {
  return richText.map((item) => item.plain_text || "").join("");
}

function plainPropertyValue(property) {
  if (!property) return "";

  switch (property.type) {
    case "title":
      return richTextToPlainText(property.title);
    case "rich_text":
      return richTextToPlainText(property.rich_text);
    case "number":
      return property.number;
    case "select":
      return property.select?.name || "";
    case "multi_select":
      return property.multi_select.map((item) => item.name);
    case "status":
      return property.status?.name || "";
    case "date":
      return property.date?.end ? `${property.date.start} - ${property.date.end}` : property.date?.start || "";
    case "checkbox":
      return property.checkbox;
    case "url":
      return property.url || "";
    case "email":
      return property.email || "";
    case "phone_number":
      return property.phone_number || "";
    case "people":
      return property.people.map((person) => person.name || person.id);
    case "relation":
      return property.relation.map((relation) => relation.id);
    case "files":
      return property.files.map((file) => file.name || file.external?.url || file.file?.url || "").filter(Boolean);
    case "created_time":
      return property.created_time;
    case "last_edited_time":
      return property.last_edited_time;
    case "formula":
      return formulaValue(property.formula);
    case "rollup":
      return rollupValue(property.rollup);
    default:
      return "";
  }
}

function formulaValue(formula) {
  if (!formula) return "";
  if (formula.type === "string") return formula.string || "";
  if (formula.type === "number") return formula.number;
  if (formula.type === "boolean") return formula.boolean;
  if (formula.type === "date") return formula.date?.start || "";
  return "";
}

function rollupValue(rollup) {
  if (!rollup) return "";
  if (rollup.type === "number") return rollup.number;
  if (rollup.type === "date") return rollup.date?.start || "";
  if (rollup.type === "array") return rollup.array.map(plainPropertyValue).filter((value) => value !== "");
  return "";
}

function normalizeProperties(properties = {}) {
  return Object.fromEntries(
    Object.entries(properties).map(([name, property]) => [name, plainPropertyValue(property)])
  );
}

function findTitle(properties = {}) {
  const titleProperty = Object.values(properties).find((property) => property.type === "title");
  return plainPropertyValue(titleProperty) || "Sans titre";
}

function blockToContent(block) {
  const value = block[block.type];

  if (block.type === "divider") {
    return { type: "divider" };
  }

  if (block.type === "image") {
    return {
      type: "image",
      url: value.type === "external" ? value.external.url : value.file.url,
      caption: richTextToPlainText(value.caption)
    };
  }

  const text = richTextToPlainText(value?.rich_text || []);
  if (!text) return null;

  return {
    type: block.type,
    text
  };
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

async function queryDatabase(databaseId) {
  const results = [];
  let cursor;

  do {
    const body = cursor ? { start_cursor: cursor } : {};
    const data = await notionRequest(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify(body)
    });

    results.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return results;
}

async function listBlockChildren(blockId) {
  const results = [];
  let cursor;

  do {
    const query = cursor ? `?start_cursor=${cursor}` : "";
    const data = await notionRequest(`/blocks/${blockId}/children${query}`);

    results.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return results;
}

async function normalizePage(page) {
  const blocks = await listBlockChildren(page.id);
  const properties = normalizeProperties(page.properties);
  const title = findTitle(page.properties);

  const slug =
    properties.Slug ||
    slugify(title);

  return {
    id: page.id,
    slug,
    title,
    notionUrl: page.url,
    lastEditedTime: page.last_edited_time,
    properties,
    content: blocks.map(blockToContent).filter(Boolean)
  };
}

async function syncCollection(collection) {
  const databaseId = process.env[collection.envVar];
  const pages = await queryDatabase(databaseId);
  const items = [];

  for (const page of pages) {
    items.push(await normalizePage(page));
  }

  items.sort((a, b) => a.title.localeCompare(b.title, "fr"));

  validateUniqueSlugs(items, collection.label);

  const output = {
    key: collection.key,
    label: collection.label,
    group: collection.group,
    notionDatabaseId: databaseId,
    generatedAt: new Date().toISOString(),
    items
  };

  await writeFile(
    path.join(outputCollectionsDir, `${collection.key}.json`),
    `${JSON.stringify(output, null, 2)}\n`,
    "utf8"
  );

  console.log(`${collection.label}: ${items.length} fiche(s)`);
}

async function writeManifest() {
  const manifest = {
    generatedAt: new Date().toISOString(),
    collections: wikiCollections.map(({ key, label, group, file }) => ({ key, label, group, file }))
  };

  await writeFile(path.join(outputDataDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function validateUniqueSlugs(items, collectionLabel) {
  const seen = new Map();

  for (const item of items) {
    const existing = seen.get(item.slug);
    

  if (!item.slug) {
    throw new Error(
      `La fiche "${item.title}" possède un slug vide.`
    );
  }

    if (existing) {
      throw new Error(
        [
          `Slug dupliqué dans la collection "${collectionLabel}"`,
          `Slug : "${item.slug}"`,
          `- ${existing.title} (${existing.id})`,
          `- ${item.title} (${item.id})`,
        ].join("\n")
      );
    }

    seen.set(item.slug, item);
  }
}

async function main() {
  await loadLocalEnv();
  const configuredCollections = requireConfig();
  await mkdir(outputCollectionsDir, { recursive: true });

  for (const collection of configuredCollections) {
    await syncCollection(collection);
  }

  const skippedCollections = wikiCollections.filter((collection) => !process.env[collection.envVar]);
  for (const collection of skippedCollections) {
    console.log(`${collection.label}: ignorée, ${collection.envVar} non renseignée`);
  }

  await writeManifest();
  console.log("Synchronisation Notion terminée.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

