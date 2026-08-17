/**
 * Fusionne les fiches de plusieurs collections en une seule liste, pour les
 * vues (`CategorizedListView`, `RulesIndexView`) qui affichent plusieurs
 * collections regroupées par une même propriété select (ex. "Catégorie").
 *
 * Les fiches qui n'ont pas cette propriété (ex. les étapes de l'assistant de
 * création de personnage) sont taguées avec le nom de leur collection, pour
 * former leur propre groupe plutôt que de tomber dans "Autres".
 */
export function mergeCollectionItems(collections, groupProperty) {
    return collections.flatMap((collection) =>
        collection.items.map((item) => {
            if (item.properties?.[groupProperty]?.type === "select") {
                return item;
            }

            return {
                ...item,
                properties: {
                    ...item.properties,
                    [groupProperty]: { type: "select", value: collection.group },
                },
            };
        })
    );
}
