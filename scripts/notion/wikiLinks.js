import { navigation } from "../../src/config/navigation.js";

/**
 * Sections cliquables depuis le texte via `[[cible]]` : associe l'id et le
 * libellé de chaque entrée de navigation (visible ou non) à son chemin,
 * sans dépendre des collections Notion (juste la config statique du site).
 */
function buildSectionTargets() {
  const targets = new Map();

  for (const group of navigation) {
    for (const item of group.children) {
      if (!item.path) continue;

      targets.set(item.id.toLowerCase(), { path: item.path, label: item.label });
      targets.set(item.label.toLowerCase(), { path: item.path, label: item.label });
    }
  }

  return targets;
}

const SECTION_TARGETS = buildSectionTargets();

const WIKI_LINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Transforme un texte contenant des marqueurs `[[cible]]` ou
 * `[[cible|Libellé]]` en `spans` (portions liées ou non). `cible` est
 * comparée (insensible à la casse) à l'id ou au libellé d'une entrée de
 * navigation. Une cible inconnue reste affichée telle quelle, en texte
 * brut, avec un avertissement dans la console pour la repérer facilement.
 * Renvoie `null` si le texte ne contient aucun lien valide (rien à changer).
 */
export function resolveWikiLinks(text) {
  if (!text.includes("[[")) return null;

  const spans = [];
  let lastIndex = 0;
  let hasLink = false;

  WIKI_LINK_PATTERN.lastIndex = 0;

  let match;
  while ((match = WIKI_LINK_PATTERN.exec(text))) {
    const [full, rawTarget, rawLabel] = match;
    const start = match.index;

    if (start > lastIndex) {
      spans.push({ text: text.slice(lastIndex, start), path: null });
    }

    const target = SECTION_TARGETS.get(rawTarget.trim().toLowerCase());

    if (target) {
      spans.push({ text: (rawLabel || target.label).trim(), path: target.path });
      hasLink = true;
    } else {
      console.warn(`  ⚠ Lien ${full} introuvable : aucune section "${rawTarget.trim()}"`);
      spans.push({ text: full, path: null });
    }

    lastIndex = start + full.length;
  }

  if (!hasLink) return null;

  if (lastIndex < text.length) {
    spans.push({ text: text.slice(lastIndex), path: null });
  }

  return spans;
}
