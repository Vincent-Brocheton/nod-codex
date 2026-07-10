import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { wikiCollections } from "./wiki-collections.js";
import slugify from "../shared/url.js";
import { loadLocalEnv, requireNotionToken } from "./notion/env.js";
import { notionRequest } from "./notion/client.js";
import { richTextToPlainText } from "./notion/richText.js";
import { normalizeProperties, findTitle, extractPropertyOptions } from "./notion/properties.js";
import { resolveWikiLinks } from "./notion/wikiLinks.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputDataDir = path.join(rootDir, "public", "data");
const outputCollectionsDir = path.join(outputDataDir, "collections");

function requireConfig() {
  requireNotionToken();

  const configuredCollections = wikiCollections.filter((collection) => process.env[collection.envVar]);

  if (configuredCollections.length === 0) {
    throw new Error("Configuration manquante dans .env: renseigne au moins une variable NOTION_DATABASE_*");
  }

  return configuredCollections;
}

async function blockToContent(block) {
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

  // Un tableau Notion n'a pas de rich_text propre : chaque ligne est un bloc
  // "table_row" enfant, avec une cellule par colonne (elle-même un tableau
  // de rich_text). Il faut donc aller chercher ces lignes séparément.
  if (block.type === "table") {
    const rowBlocks = await listBlockChildren(block.id);
    const rows = rowBlocks.map((rowBlock) =>
      (rowBlock.table_row?.cells || []).map((cell) => richTextToPlainText(cell))
    );

    if (rows.length === 0) return null;

    return {
      type: "table",
      hasColumnHeader: Boolean(value.has_column_header),
      rows
    };
  }

  const text = richTextToPlainText(value?.rich_text || []);
  if (!text) return null;

  const content = { type: block.type, text };
  const spans = resolveWikiLinks(text);
  if (spans) content.spans = spans;

  return content;
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

  const content = (await Promise.all(blocks.map((block) => blockToContent(block)))).filter(Boolean);

  return {
    id: page.id,
    slug,
    title,
    notionUrl: page.url,
    lastEditedTime: page.last_edited_time,
    properties,
    content
  };
}

async function fetchDatabase(databaseId) {
  return notionRequest(`/databases/${databaseId}`);
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
        // Repris directement dans les fiches liées (ex. Atouts/Handicaps
        // d'un Clan) pour l'afficher sans avoir à recharger la fiche cible.
        cout: item.properties?.["Coût"]?.value || null,
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
    if (!item.slug) {
      throw new Error(`La fiche "${item.title}" possède un slug vide.`);
    }

    const existing = seen.get(item.slug);

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
