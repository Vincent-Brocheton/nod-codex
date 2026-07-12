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
 * n'est réutilisable que si ce timestamp n'a pas bougé depuis.
 *
 * `databaseLastEditedTime` (celui de la base, pas d'une fiche) sert à
 * détecter un changement de schéma (propriété ajoutée/retirée/renommée) :
 * ça ne touche le `last_edited_time` d'aucune fiche existante, alors que la
 * forme des propriétés retournées par Notion pour CES fiches change bel et
 * bien. Un cache dont la base a changé de schéma est donc ignoré en bloc
 * (resync complet de la collection, une fois), plutôt que de resservir des
 * fiches auxquelles il manquerait la nouvelle propriété.
 *
 * Absent, corrompu, d'une version périmée ou d'un schéma périmé, on repart
 * simplement d'un cache vide.
 */
export async function loadCache(collectionKey, databaseLastEditedTime) {
  try {
    const raw = await readFile(path.join(cacheDir, `${collectionKey}.json`), "utf8");
    const parsed = JSON.parse(raw);

    if (parsed.version !== CACHE_VERSION) return new Map();
    if (parsed.databaseLastEditedTime !== databaseLastEditedTime) return new Map();

    return new Map(Object.entries(parsed.entries));
  } catch {
    return new Map();
  }
}

export async function saveCache(collectionKey, databaseLastEditedTime, entries) {
  await mkdir(cacheDir, { recursive: true });

  await writeFile(
    path.join(cacheDir, `${collectionKey}.json`),
    JSON.stringify({ version: CACHE_VERSION, databaseLastEditedTime, entries: Object.fromEntries(entries) }, null, 2),
    "utf8"
  );
}
