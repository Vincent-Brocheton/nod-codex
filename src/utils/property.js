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
