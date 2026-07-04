function normalizeKey(key) {
    return key
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

/**
 * Cherche une propriete par mots-cles plutot que par nom exact, pour
 * tolerer les variations de saisie entre bases Notion (ex. "Cout en point
 * de sang" / "Couts en points de sang" / "Cout en point de sang").
 */
export default function findPropertyValue(item, tokens) {
    const entry = Object.entries(item.properties || {}).find(([name]) => {
        const normalized = normalizeKey(name);
        return tokens.every((token) => normalized.includes(token));
    });

    return entry?.[1];
}
