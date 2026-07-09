import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Charge `.env` (à la racine du projet) dans `process.env`, sans écraser
 * les variables déjà définies. Silencieux si le fichier n'existe pas
 * (utile en CI, où les variables sont déjà dans l'environnement).
 */
export async function loadLocalEnv() {
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

export function requireNotionToken() {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("Configuration manquante dans .env: NOTION_TOKEN");
  }
}
