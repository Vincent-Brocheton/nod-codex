/**
 * Index collectionKey -> { path, icon } de l'entrée de navigation qui
 * référence cette collection, à partir de la config statique du site
 * (`src/config/navigation.js`). Partagé entre le client (résoudre le lien
 * d'une fiche liée) et le script de synchro (retrouver le chemin/l'icône
 * d'une collection pour "Dernières mises à jour", voir sync-notion.js).
 */
export function buildCollectionNavIndex(navigation) {
    const index = new Map();

    for (const group of navigation) {
        for (const item of group.children) {
            if (item.type !== "collection") continue;

            for (const key of item.collections) {
                index.set(key, { path: item.path, icon: item.icon });
            }
        }
    }

    return index;
}
