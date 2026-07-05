function normalizeKey(key) {
    return key
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

/**
 * Cherche une propriété par mots-clés plutôt que par nom exact, pour
 * tolérer les variations de saisie entre bases Notion (ex. "Coût en point
 * de sang" / "Coûts en points de sang" / "Coût en points de sang").
 */
export default function findPropertyValue(item, tokens) {
    const entry = Object.entries(item.properties || {}).find(([name]) => {
        const normalized = normalizeKey(name);
        return tokens.every((token) => normalized.includes(token));
    });

    return entry?.[1];
}
