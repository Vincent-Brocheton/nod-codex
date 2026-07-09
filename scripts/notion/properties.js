import { richTextToPlainText } from "./richText.js";

/**
 * Convertit une propriété Notion en { type, value } exploitable côté client.
 * Le type est conservé (au lieu d'être aplati) pour permettre un rendu
 * adapté par nature de donnée (relation -> lien, checkbox -> Oui/Non, etc.).
 * Les relations restent des ids bruts à ce stade ; elles sont résolues
 * ensuite par `resolveRelations`, une fois toutes les collections chargées.
 */
export function normalizeProperty(property) {
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

export function normalizeProperties(properties = {}) {
  return Object.fromEntries(
    Object.entries(properties).map(([name, property]) => [name, normalizeProperty(property)])
  );
}

export function findTitle(properties = {}) {
  const titleProperty = Object.values(properties).find((property) => property.type === "title");
  return richTextToPlainText(titleProperty?.title) || "Sans titre";
}

/**
 * Options configurées (dans Notion) pour les propriétés select/multi_select
 * d'une base, ex. { "Coût": ["1", "2"] }. Sert à connaître l'ensemble des
 * valeurs possibles même si aucune fiche ne les utilise encore.
 */
export function extractPropertyOptions(database) {
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
