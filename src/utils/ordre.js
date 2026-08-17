/**
 * Tri par la propriété numérique "Ordre" (utilisée par les bases où l'ordre
 * d'affichage ne peut pas être déduit du titre, ex. les étapes de création
 * de personnage). Tri stable : les fiches sans "Ordre" gardent leur position
 * relative d'origine plutôt que d'être ramenées au début ou à la fin.
 */
export function ordreOf(item) {
    const value = item.properties?.Ordre?.value;
    return typeof value === "number" ? value : Infinity;
}

export function sortByOrdre(items) {
    return [...items].sort((a, b) => ordreOf(a) - ordreOf(b));
}
