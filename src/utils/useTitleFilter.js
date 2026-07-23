import { useMemo, useState } from "react";

/**
 * État de recherche par titre partagé par les pages d'index (Clans,
 * Disciplines, Techniques, Compétences) : ne gère que le filtre, le tri
 * reste au choix de l'appelant (ex. Clans n'en applique aucun).
 *
 * `filtered` est mémoïsé sur `[items, query]` : sans ça, sa référence
 * changerait à chaque rendu même si la recherche n'a pas bougé, ce qui
 * casserait la mémoïsation de tout composant qui en dépend en aval (ex.
 * DisciplinesIndexView, qui regroupe/trie `filtered`).
 */
export default function useTitleFilter(items) {
    const [query, setQuery] = useState("");

    const normalizedQuery = query.trim().toLowerCase();
    const filtered = useMemo(
        () => items.filter((item) => item.title.toLowerCase().includes(normalizedQuery)),
        [items, normalizedQuery]
    );

    return { query, setQuery, filtered };
}
