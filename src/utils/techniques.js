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
        .filter(isLearnable)
        .filter((item) => techniqueDisciplineRefs(item).some((ref) => ref.slug === disciplineSlug))
        .sort((a, b) => a.title.localeCompare(b.title, "fr"));
}

// Une technique n'est apprenable que si toutes les disciplines listées dans
// "Prérequis" sont résolues dans la relation "Disciplines" : si l'une d'elles
// n'existe pas dans la base Disciplines (ex. un pouvoir de bloodline non
// répertorié, comme Visceratika ou Melpominée), la technique ne peut pas être
// apprise en pratique et ne doit apparaître nulle part (liste générale ou
// fiche d'une discipline requise).
export function isLearnable(item) {
    const prereqCount = normalizeProperty(item?.properties?.Prerequis).value?.length || 0;
    return prereqCount === techniqueDisciplineRefs(item).length;
}
