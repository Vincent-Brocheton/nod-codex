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
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

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

/**
 * Convertit une propriété Notion en { type, value } exploitable côté client.
 * Le type est conservé (au lieu d'être aplati) pour permettre un rendu
 * adapté par nature de donnée (relation -> lien, checkbox -> Oui/Non, etc.).
 * Les relations restent des ids bruts à ce stade ; elles sont résolues
 * ensuite par `resolveRelations`, une fois toutes les collections chargées.
 */
function normalizeProperty(property) {
  if (!property) return { type: "text", value: "" };

  switch (property.type) {
    case "title":
      return { type: "text", value: richTextToPlainText(property.title) };
    case "rich_text":
      return { type: "text", value: richTextToPlainText(property.rich_text) };
    case "number":
      return { type: "number", value: property.number };
    case "select":
      return { type: "select", value: property.select?.name || "" };
    case "multi_select":
      return { type: "multi_select", value: property.multi_select.map((item) => item.name) };
    case "status":
      return { type: "select", value: property.status?.name || "" };
    case "date":
      return {
        type: "date",
        value: property.date?.end ? `${property.date.start} → ${property.date.end}` : property.date?.start || "",
      };
    case "checkbox":
      return { type: "checkbox", value: property.checkbox };
    case "url":
      return { type: "url", value: property.url || "" };
    case "email":
      return { type: "text", value: property.email || "" };
    case "phone_number":
      return { type: "text", value: property.phone_number || "" };
    case "people":
      return { type: "multi_select", value: property.people.map((person) => person.name || person.id) };
    case "relation":
      // ids bruts, résolus plus tard vers { id, title, slug, collectionKey }
      return { type: "relation", value: property.relation.map((relation) => relation.id) };
    case "files":
      return {
        type: "multi_select",
        value: property.files.map((file) => file.name || file.external?.url || file.file?.url || "").filter(Boolean),
      };
    case "created_time":
      return { type: "date", value: property.created_time };
    case "last_edited_time":
      return { type: "date", value: property.last_edited_time };
    case "formula":
      return normalizeFormula(property.formula);
    case "rollup":
      return normalizeRollup(property.rollup);
    default:
      return { type: "text", value: "" };
  }
}

function normalizeFormula(formula) {
  if (!formula) return { type: "text", value: "" };
  if (formula.type === "string") return { type: "text", value: formula.string || "" };
  if (formula.type === "number") return { type: "number", value: formula.number };
  if (formula.type === "boolean") return { type: "checkbox", value: formula.boolean };
  if (formula.type === "date") return { type: "date", value: formula.date?.start || "" };
  return { type: "text", value: "" };
}

function normalizeRollup(rollup) {
  if (!rollup) return { type: "text", value: "" };
  if (rollup.type === "number") return { type: "number", value: rollup.number };
  if (rollup.type === "date") return { type: "date", value: rollup.date?.start || "" };
  if (rollup.type === "array") {
    return {
      type: "multi_select",
      value: rollup.array.map((entry) => normalizeProperty(entry).value).filter((value) => value !== ""),
    };
  }
  return { type: "text", value: "" };
}

function normalizeProperties(properties = {}) {
  return Object.fromEntries(
    Object.entries(properties).map(([name, property]) => [name, normalizeProperty(property)])
  );
}

function findTitle(properties = {}) {
  const titleProperty = Object.values(properties).find((property) => property.type === "title");
  return richTextToPlainText(titleProperty?.title) || "Sans titre";
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

// L'API Notion tolère mal un trop grand nombre de requêtes simultanées.
// Ce limiteur borne le nombre d'appels HTTP réellement en vol à tout
// instant, quel que soit le niveau de parallélisme exprimé par le code
// appelant (bases et fiches traitées avec Promise.all).
function createLimiter(concurrency) {
  let active = 0;
  const queue = [];

  function runNext() {
    if (active >= concurrency || queue.length === 0) return;

    active++;
    const { fn, resolve, reject } = queue.shift();

    fn()
      .then(resolve, reject)
      .finally(() => {
        active--;
        runNext();
      });
  }

  return function limit(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      runNext();
    });
  };
}

const limitNotionRequest = createLimiter(6);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function notionRequest(endpoint, options = {}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await limitNotionRequest(() =>
      fetch(`https://api.notion.com/v1${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
          "Notion-Version": process.env.NOTION_VERSION || "2022-06-28",
          "Content-Type": "application/json",
          ...(options.headers || {})
        }
      })
    );

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after")) || 1;
      await sleep(retryAfter * 1000);
      continue;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Erreur Notion ${response.status} sur ${endpoint}: ${body}`);
    }

    return response.json();
  }

  throw new Error(`Erreur Notion: trop de tentatives après des réponses 429 sur ${endpoint}`);
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
    properties.Slug?.value ||
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

async function fetchDatabase(databaseId) {
  return notionRequest(`/databases/${databaseId}`);
}

/**
 * Options configurées (dans Notion) pour les propriétés select/multi_select
 * d'une base, ex. { "Coût": ["1", "2"] }. Sert à connaître l'ensemble des
 * valeurs possibles même si aucune fiche ne les utilise encore.
 */
function extractPropertyOptions(database) {
  const propertyOptions = {};

  for (const [name, property] of Object.entries(database.properties || {})) {
    if (property.type === "select") {
      propertyOptions[name] = property.select.options.map((option) => option.name);
    } else if (property.type === "multi_select") {
      propertyOptions[name] = property.multi_select.options.map((option) => option.name);
    }
  }

  return propertyOptions;
}

// Une fiche avec une case à cocher "Visible" décochée est exclue de la
// synchro (elle n'apparaît nulle part, y compris comme fiche liée). Les
// bases qui n'ont pas cette propriété ne sont pas concernées.
function isVisible(item) {
  const property = item.properties?.Visible;
  if (!property || property.type !== "checkbox") return true;

  return property.value === true;
}

async function fetchCollectionItems(collection) {
  const databaseId = process.env[collection.envVar];

  const [database, pages] = await Promise.all([
    fetchDatabase(databaseId),
    queryDatabase(databaseId),
  ]);

  const items = await Promise.all(pages.map((page) => normalizePage(page)));

  const visibleItems = items.filter(isVisible);
  visibleItems.sort((a, b) => a.title.localeCompare(b.title, "fr"));

  return {
    databaseId,
    items: visibleItems,
    propertyOptions: extractPropertyOptions(database),
    description: richTextToPlainText(database.description),
  };
}

/**
 * Index id de page Notion -> fiche, tous collections confondues.
 * Nécessaire pour résoudre les relations qui pointent vers une autre
 * base (ex. un Clan qui référence ses Disciplines).
 */
function buildRegistry(fetched) {
  const registry = new Map();

  for (const { collection, items } of fetched) {
    for (const item of items) {
      registry.set(item.id, {
        collectionKey: collection.key,
        slug: item.slug,
        title: item.title,
      });
    }
  }

  return registry;
}

function resolveRelations(items, registry) {
  for (const item of items) {
    for (const property of Object.values(item.properties)) {
      if (property.type !== "relation") continue;

      property.value = property.value
        .map((id) => registry.get(id))
        .filter(Boolean);
    }
  }
}

async function writeCollectionFile(collection, databaseId, items, propertyOptions, description) {
  validateUniqueSlugs(items, collection.label);

  const output = {
    key: collection.key,
    label: collection.label,
    group: collection.group,
    description,
    notionDatabaseId: databaseId,
    generatedAt: new Date().toISOString(),
    propertyOptions,
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

  const fetched = await Promise.all(
    configuredCollections.map(async (collection) => {
      const { databaseId, items, propertyOptions, description } = await fetchCollectionItems(collection);
      return { collection, databaseId, items, propertyOptions, description };
    })
  );

  // Les relations ne peuvent être résolues qu'une fois toutes les
  // collections chargées (une relation peut pointer vers une autre base).
  const registry = buildRegistry(fetched);

  await Promise.all(
    fetched.map(({ collection, databaseId, items, propertyOptions, description }) => {
      resolveRelations(items, registry);
      return writeCollectionFile(collection, databaseId, items, propertyOptions, description);
    })
  );

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
