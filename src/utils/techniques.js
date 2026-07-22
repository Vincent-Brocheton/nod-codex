import { normalizeProperty } from "./property";

function techniqueDisciplineRefs(item) {
    const property = item?.properties?.Disciplines;
    return property?.type === "relation" ? property.value : [];
}

// "Prerequis" est un multi_select Notion (discipline + niveau requis, ex.
// "Chimérie •"), affiché tel quel plutôt que reconstruit depuis la relation
// "Disciplines" (qui ne porte pas le niveau requis).
export function techniquePrereqText(item) {
    const { value } = normalizeProperty(item?.properties?.Prerequis);
    return Array.isArray(value) && value.length ? value.join(", ") : null;
}

export function techniquesForDiscipline(collection, disciplineSlug) {
    return (collection?.items || [])
        .filter((item) => techniqueDisciplineRefs(item).some((ref) => ref.slug === disciplineSlug))
        .sort((a, b) => a.title.localeCompare(b.title, "fr"));
}
