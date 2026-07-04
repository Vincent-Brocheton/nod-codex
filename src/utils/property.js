const NOTION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function looksLikeIdList(value) {
    return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((entry) => typeof entry === "string" && NOTION_ID_PATTERN.test(entry))
    );
}

/**
 * Ramène une propriété au format { type, value }.
 * Les données déjà synchronisées avec le script à jour ont ce format nativement.
 * Les anciennes données (valeurs brutes, sans type) sont ramenées à ce format
 * par une heuristique simple, pour rester affichables en attendant une resynchronisation.
 */
export function normalizeProperty(raw) {
    if (raw && typeof raw === "object" && !Array.isArray(raw) && "type" in raw && "value" in raw) {
        return raw;
    }

    if (typeof raw === "boolean") {
        return { type: "checkbox", value: raw };
    }

    if (looksLikeIdList(raw)) {
        return { type: "relation-unresolved", value: raw };
    }

    return { type: "text", value: raw };
}

export function isPropertyEmpty(property) {
    const { value } = property;

    if (value === null || value === undefined || value === "") return true;
    return Array.isArray(value) && value.length === 0;


}

export function propertyText(property) {
    const { type, value } = property;

    if (type === "checkbox") return value ? "Oui" : "Non";
    if (type === "relation") return value.map((ref) => ref.title).join(" ");
    if (type === "relation-unresolved") return "";
    if (Array.isArray(value)) return value.join(" ");

    return String(value);
}

// Propriété "titre" Notion (Nom/Name) : déjà affichée comme titre de la
// fiche, donc redondante dans un tableau de propriétés.
const TITLE_PROPERTY_NAMES = new Set(["nom", "name"]);

/**
 * Propriétés d'une fiche prêtes à afficher : normalisées, sans les valeurs
 * vides (évite les lignes vides dans un tableau de propriétés) ni le champ
 * titre (déjà affiché comme h1).
 */
export function getVisibleProperties(item) {
    return Object.entries(item.properties || {})
        .filter(([name]) => !TITLE_PROPERTY_NAMES.has(name.trim().toLowerCase()))
        .map(([name, raw]) => [name, normalizeProperty(raw)])
        .filter(([, property]) => !isPropertyEmpty(property));
}
