import { normalizeProperty } from "./property";

export function disciplineRefs(item) {
    const property = item?.properties?.Discipline;
    return property?.type === "relation" ? property.value : [];
}

export function itemNiveau(item) {
    const value = Number(normalizeProperty(item?.properties?.Niveau).value);
    return Number.isFinite(value) ? value : Infinity;
}

export function powersForDiscipline(collection, disciplineSlug) {
    return (collection?.items || [])
        .filter((item) =>
            disciplineRefs(item).some((ref) => ref.slug === disciplineSlug)
        )
        .sort((a, b) => itemNiveau(a) - itemNiveau(b));
}
