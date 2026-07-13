import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { wikiCollections } from "./wiki-collections.js";
import slugify from "../shared/url.js";
import { loadLocalEnv, requireNotionToken } from "./notion/env.js";
import { notionRequest } from "./notion/client.js";
import { richTextToPlainText, richTextToSegments } from "./notion/richText.js";
import { normalizeProperties, findTitle, extractPropertyOptions } from "./notion/properties.js";
import { resolveWikiLinks, buildItemTargets } from "./notion/wikiLinks.js";
import { loadCache, saveCache } from "./notion/cache.js";
import { navigation } from "../src/config/navigation.js";

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

  // `segments` porte la mise en forme (ex. gras) issue de Notion ; consommé
  // par `applyContentLinks` pour produire les `spans` finaux, puis retiré
  // (voir plus bas) une fois cette étape faite.
  return { type: block.type, text, segments: richTextToSegments(value?.rich_text || []) };
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

// Détaille, par base, quelles fiches ont réellement été retéléchargées
// (nouvelles/modifiées), lesquelles viennent du cache (juste un total, pour
// ne pas noyer la sortie sur les grosses bases) et lesquelles ont disparu
// de Notion depuis le dernier sync.
function logSyncSummary(label, { added, modified, unchangedCount, removed }) {
  const total = added.length + modified.length + unchangedCount;

  if (added.length === 0 && modified.length === 0 && removed.length === 0) {
    console.log(`${label} : rien à synchroniser (${unchangedCount}/${total} fiche(s) déjà à jour)`);
    return;
  }

  console.log(`${label} : synchronisation de ${added.length + modified.length}/${total} fiche(s)`);
  if (added.length) console.log(`  + nouvelle(s) : ${added.join(", ")}`);
  if (modified.length) console.log(`  ~ modifiée(s) : ${modified.join(", ")}`);
  if (removed.length) console.log(`  - disparue(s) : ${removed.join(", ")}`);
}

async function fetchCollectionItems(collection) {
  const databaseId = process.env[collection.envVar];

  const [database, pages] = await Promise.all([
    fetchDatabase(databaseId),
    queryDatabase(databaseId),
  ]);

  // Chargé seulement une fois la base connue : un changement de schéma
  // (propriété ajoutée/retirée) invalide tout le cache de la collection,
  // voir `loadCache`.
  const cache = await loadCache(collection.key, database.last_edited_time);

  // Chaque fiche retombe dans une des trois catégories ci-dessous, pour
  // pouvoir afficher précisément ce qui a été retéléchargé (et donc ce qui
  // ne l'a pas été) plutôt qu'un simple total agrégé.
  const addedIds = [];
  const modifiedIds = [];
  const unchangedIds = [];

  const items = await Promise.all(
    pages.map((page) => {
      const cached = cache.get(page.id);

      if (cached && cached.lastEditedTime === page.last_edited_time) {
        unchangedIds.push(page.id);
        return cached.item;
      }

      (cached ? modifiedIds : addedIds).push(page.id);
      return normalizePage(page);
    })
  );

  // Écrit avant toute résolution de relations/liens (qui mute les fiches en
  // place plus tard dans `main`) : le cache doit garder la forme brute de
  // `normalizePage`, seule réutilisable telle quelle au prochain sync.
  const nextCache = pages.map((page, index) => [page.id, { lastEditedTime: page.last_edited_time, item: items[index] }]);
  await saveCache(collection.key, database.last_edited_time, nextCache);

  const titleById = new Map(pages.map((page, index) => [page.id, items[index].title]));
  const removedTitles = [...cache.keys()]
    .filter((id) => !titleById.has(id))
    .map((id) => cache.get(id).item.title);

  logSyncSummary(collection.label, {
    added: addedIds.map((id) => titleById.get(id)),
    modified: modifiedIds.map((id) => titleById.get(id)),
    unchangedCount: unchangedIds.length,
    removed: removedTitles,
  });

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
        // d'un Clan, Lignées d'un Clan) pour les afficher sans avoir à
        // recharger la fiche cible.
        cout: item.properties?.["Coût"]?.value || null,
        approbation: item.properties?.Approbation?.value === true,
        complet: item.properties?.Complet?.value === true,
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

/**
 * Combine la mise en forme Notion (`segments`, ex. gras) et les marqueurs
 * `[[cible]]` (résolus une fois toutes les collections chargées, une cible
 * "fiche précise" pouvant pointer vers n'importe quelle base) en une seule
 * liste de `spans` par bloc. Un marqueur `[[cible]]` est cherché dans le
 * texte de chaque segment indépendamment : dans le cas rare où un marqueur
 * chevauche deux mises en forme différentes (ex. moitié en gras), il ne
 * sera pas reconnu comme lien, limitation acceptée plutôt que de complexifier
 * la fusion pour un cas marginal. Doit tourner après `buildRegistry`.
 */
function applyContentLinks(fetched, registry) {
  const itemTargets = buildItemTargets(registry);

  for (const { items } of fetched) {
    for (const item of items) {
      for (const block of item.content) {
        if (!block.segments) continue;

        block.spans = block.segments.flatMap((segment) => {
          const linkSpans = resolveWikiLinks(segment.text, itemTargets);

          if (!linkSpans) return [{ text: segment.text, bold: segment.bold }];

          return linkSpans.map((span) => ({ ...span, bold: segment.bold }));
        });

        delete block.segments;
      }
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

function collectionNavInfo() {
  const info = new Map();

  for (const group of navigation) {
    for (const item of group.children) {
      if (item.type !== "collection") continue;

      for (const key of item.collections) {
        info.set(key, { path: item.path, icon: item.icon });
      }
    }
  }

  return info;
}

/**
 * Les fiches les plus récemment modifiées, toutes collections dotées d'une
 * page de navigation confondues (les autres, ex. Historiques, ne sont
 * accessibles que par lien interne et n'ont pas de page à elles pour ce
 * classement). Calculé à partir des fiches déjà récupérées, sans appel
 * Notion supplémentaire.
 */
function computeRecentItems(fetched, limit = 20) {
  const navInfo = collectionNavInfo();

  return fetched
    .flatMap(({ collection, items }) => {
      const info = navInfo.get(collection.key);
      if (!info) return [];

      return items.map((item) => ({
        title: item.title,
        slug: item.slug,
        collectionKey: collection.key,
        collectionLabel: collection.label,
        path: info.path,
        icon: info.icon,
        lastEditedTime: item.lastEditedTime,
      }));
    })
    .sort((a, b) => new Date(b.lastEditedTime) - new Date(a.lastEditedTime))
    .slice(0, limit);
}

async function writeManifest(fetched) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    collections: wikiCollections.map(({ key, label, group, file }) => ({ key, label, group, file })),
    recent: computeRecentItems(fetched),
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

  // Les relations et les liens de contenu ne peuvent être résolus qu'une
  // fois toutes les collections chargées (ils peuvent pointer vers une
  // autre base).
  const registry = buildRegistry(fetched);
  applyContentLinks(fetched, registry);

  // `allSettled` plutôt que `all` : une base en erreur (ex. slug dupliqué)
  // ne doit jamais empêcher l'écriture des autres, ni laisser leur fichier
  // à moitié écrit si le process s'arrêtait pendant qu'elles y sont encore.
  const results = await Promise.allSettled(
    fetched.map(({ collection, databaseId, items, propertyOptions, description }) => {
      resolveRelations(items, registry);
      return writeCollectionFile(collection, databaseId, items, propertyOptions, description);
    })
  );

  const failures = results
    .map((result, index) => ({ result, label: fetched[index].collection.label }))
    .filter(({ result }) => result.status === "rejected");

  const skippedCollections = wikiCollections.filter((collection) => !process.env[collection.envVar]);
  for (const collection of skippedCollections) {
    console.log(`${collection.label}: ignorée, ${collection.envVar} non renseignée`);
  }

  await writeManifest(fetched);

  if (failures.length > 0) {
    console.error("\nSynchronisation terminée avec des erreurs (fichier précédent conservé pour ces bases) :");
    for (const { label, result } of failures) {
      console.error(`  ✗ ${label} : ${result.reason.message}`);
    }
    process.exit(1);
  }

  console.log("Synchronisation Notion terminée.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
