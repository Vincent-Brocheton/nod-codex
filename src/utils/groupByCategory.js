import { selectPropertyValue } from "./groupFilter";

const FALLBACK_CATEGORY = "Autres";

/**
 * Regroupe des fiches par une propriété select (ex. Catégorie), triées par
 * ordre alphabétique ; seules les valeurs utilisées par au moins une fiche
 * apparaissent. On trie ici plutôt que de suivre `propertyOptions` (l'ordre
 * défini dans Notion) car ce fichier est régénéré à chaque synchro et ne
 * doit pas être la source de vérité pour l'ordre affiché. Les fiches sans
 * valeur tombent dans "Autres", toujours affichée en dernier.
 */
export default function groupByCategory(items, groupProperty) {

    function categoryOf(item) {
        return selectPropertyValue(item, groupProperty) || FALLBACK_CATEGORY;
    }

    const usedCategories = [...new Set(items.map(categoryOf))];

    const orderedCategories = [
        ...usedCategories
            .filter((category) => category !== FALLBACK_CATEGORY)
            .sort((a, b) => a.localeCompare(b, "fr")),
        ...usedCategories.filter((category) => category === FALLBACK_CATEGORY),
    ];

    return orderedCategories.map((category) => ({
        key: category,
        label: category,
        items: items.filter((item) => categoryOf(item) === category),
    }));
}
