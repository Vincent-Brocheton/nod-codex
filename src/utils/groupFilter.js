export function selectPropertyValue(item, propertyName) {
    const property = item.properties?.[propertyName];
    return property?.type === "select" ? property.value : "";
}

/**
 * Restreint une liste d'items selon la config `groupFilter` d'une entrée
 * de navigation (`{ property, only }` ou `{ property, exclude }`). Permet
 * de répartir une même collection entre plusieurs sections (ex. les Règles
 * de "Création de Personnage" affichées uniquement sous /creation, le
 * reste sous /regles).
 */
export function applyGroupFilter(items, groupFilter) {
    if (!groupFilter) return items;
    const { property, only, exclude } = groupFilter;

    return items.filter((item) => {
        const value = selectPropertyValue(item, property);
        if (only) return only.includes(value);
        if (exclude) return !exclude.includes(value);
        return true;
    });
}
