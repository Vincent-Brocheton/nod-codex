import { selectPropertyValue } from "./groupFilter";

const FALLBACK_CATEGORY = "Autres";

/**
 * Regroupe des fiches par une propriété select (ex. Catégorie), dans
 * l'ordre configuré côté Notion (`propertyOptions`) ; seules les valeurs
 * utilisées par au moins une fiche apparaissent, celles non prévues dans
 * Notion étant ajoutées à la fin. Les fiches sans valeur tombent dans
 * "Autres".
 */
export default function groupByCategory(items, propertyOptions, groupProperty) {

    function categoryOf(item) {
        return selectPropertyValue(item, groupProperty) || FALLBACK_CATEGORY;
    }

    const configuredCategories = propertyOptions?.[groupProperty] || [];
    const usedCategories = [...new Set(items.map(categoryOf))];

    const orderedCategories = [
        ...configuredCategories.filter((category) => usedCategories.includes(category)),
        ...usedCategories.filter((category) => !configuredCategories.includes(category)),
    ];

    return orderedCategories.map((category) => ({
        key: category,
        label: category,
        items: items.filter((item) => categoryOf(item) === category),
    }));
}
