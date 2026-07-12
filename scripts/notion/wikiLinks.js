import { navigation } from "../../src/config/navigation.js";

/**
 * Sections cliquables depuis le texte via `[[cible]]` : associe l'id et le
 * libellé de chaque entrée de navigation (visible ou non) à son chemin,
 * sans dépendre des collections Notion (juste la config statique du site).
 * Prioritaire sur les fiches précises en cas de nom identique.
 */
function buildSectionTargets() {
  const targets = new Map();

  for (const group of navigation) {
    for (const item of group.children) {
      if (!item.path) continue;

      targets.set(item.id.toLowerCase(), { kind: "section", path: item.path, label: item.label });
      targets.set(item.label.toLowerCase(), { kind: "section", path: item.path, label: item.label });
    }
  }

  return targets;
}

const SECTION_TARGETS = buildSectionTargets();

const WIKI_LINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Table des cibles "fiche précise" (une par titre exact connu), à partir
 * du registre global (toutes collections confondues, une fois toutes
 * chargées). Une cible fiche s'ouvre en popup au clic plutôt que de
 * naviguer, contrairement à une cible section.
 */
export function buildItemTargets(registry) {
  const targets = new Map();

  for (const entry of registry.values()) {
    if (!entry.title || entry.title.length < 2) continue;

    targets.set(entry.title.toLowerCase(), {
      kind: "item",
      collectionKey: entry.collectionKey,
      slug: entry.slug,
      label: entry.title,
    });
  }

  return targets;
}

/**
 * Transforme un texte contenant des marqueurs `[[cible]]` ou
 * `[[cible|Libellé]]` en `spans` (portions liées ou non). `cible` est
 * comparée (insensible à la casse) à l'id/libellé d'une section, sinon au
 * titre exact d'une fiche (via `itemTargets`, voir `buildItemTargets`).
 * Une cible inconnue reste affichée telle quelle, en texte brut, avec un
 * avertissement dans la console pour la repérer facilement. Renvoie `null`
 * si le texte ne contient aucun lien valide (rien à changer).
 */
export function resolveWikiLinks(text, itemTargets = new Map()) {
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
      spans.push({ text: text.slice(lastIndex, start) });
    }

    const key = rawTarget.trim().toLowerCase();
    const target = SECTION_TARGETS.get(key) || itemTargets.get(key);

    if (!target) {
      console.warn(`  ⚠ Lien ${full} introuvable : aucune section ou fiche "${rawTarget.trim()}"`);
      spans.push({ text: full });
    } else if (target.kind === "section") {
      spans.push({ text: (rawLabel || target.label).trim(), path: target.path });
      hasLink = true;
    } else {
      spans.push({
        text: (rawLabel || target.label).trim(),
        item: { collectionKey: target.collectionKey, slug: target.slug },
      });
      hasLink = true;
    }

    lastIndex = start + full.length;
  }

  if (!hasLink) return null;

  if (lastIndex < text.length) {
    spans.push({ text: text.slice(lastIndex) });
  }

  return spans;
}
