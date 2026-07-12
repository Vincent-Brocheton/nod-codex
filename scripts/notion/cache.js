import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const cacheDir = path.join(rootDir, "scripts", ".cache");

// Incrémenté à chaque changement de forme des données mises en cache (ex.
// nouveau champ sur les blocs de contenu) : un cache d'une version
// différente est ignoré (resync complet une fois), pour ne jamais resservir
// une fiche dont la structure ne correspond plus à ce qu'attend le script.
const CACHE_VERSION = 2;

/**
 * Cache local (non versionné dans git) du résultat brut de `normalizePage`
 * par fiche, pour éviter de re-télécharger le contenu (blocs) des fiches
 * inchangées d'un sync à l'autre. Indexé par id de page Notion, avec le
 * `last_edited_time` observé au moment de la mise en cache : une entrée
 * n'est réutilisable que si ce timestamp n'a pas bougé depuis (il reflète
 * aussi bien un changement de propriété que de contenu). Absent, corrompu
 * ou d'une version périmée, on repart simplement d'un cache vide (resync
 * complet).
 */
export async function loadCache(collectionKey) {
  try {
    const raw = await readFile(path.join(cacheDir, `${collectionKey}.json`), "utf8");
    const parsed = JSON.parse(raw);

    if (parsed.version !== CACHE_VERSION) return new Map();

    return new Map(Object.entries(parsed.entries));
  } catch {
    return new Map();
  }
}

export async function saveCache(collectionKey, entries) {
  await mkdir(cacheDir, { recursive: true });

  await writeFile(
    path.join(cacheDir, `${collectionKey}.json`),
    JSON.stringify({ version: CACHE_VERSION, entries: Object.fromEntries(entries) }, null, 2),
    "utf8"
  );
}
