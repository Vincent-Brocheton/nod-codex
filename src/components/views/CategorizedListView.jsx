import { useNavigate } from "react-router-dom";
import ItemListButton from "../ItemListButton";
import LoadingState from "../States/LoadingState";
import { applyGroupFilter, selectPropertyValue } from "../../utils/groupFilter";

const FALLBACK_CATEGORY = "Autres";

/**
 * Liste d'une collection groupée visuellement par une propriété select
 * (ex. les Règles par Catégorie), plutôt qu'une liste plate. L'ordre des
 * groupes suit celui configuré dans Notion (`propertyOptions`) ; seules
 * les catégories qui ont au moins une fiche sont affichées.
 *
 * `activeNavigation.groupFilter` permet de restreindre les fiches visibles
 * (ex. n'afficher que la catégorie "Création de Personnage" sous /creation,
 * et l'exclure sous /regles) sans dupliquer ce composant.
 */
export default function CategorizedListView({ wiki, groupProperty = "Catégorie" }) {

    const navigate = useNavigate();
    const { loadedCollections, computed } = wiki.collections;
    const { activeNavigation } = wiki.navigation;
    const { visibleItems, activeItem, loading } = computed;

    const collectionKey = activeNavigation.collections[0];
    const collection = loadedCollections[collectionKey];
    const groupFilter = activeNavigation.groupFilter;

    const filteredItems = applyGroupFilter(visibleItems, groupFilter);
    const showGroupTitles = !(groupFilter?.only?.length === 1);

    function categoryOf(item) {
        return selectPropertyValue(item, groupProperty) || FALLBACK_CATEGORY;
    }

    const configuredCategories = collection?.propertyOptions?.[groupProperty] || [];
    const usedCategories = [...new Set(filteredItems.map(categoryOf))];

    const orderedCategories = [
        ...configuredCategories.filter((category) => usedCategories.includes(category)),
        ...usedCategories.filter((category) => !configuredCategories.includes(category)),
    ];

    const groups = orderedCategories.map((category) => ({
        key: category,
        label: category,
        items: filteredItems.filter((item) => categoryOf(item) === category),
    }));

    return (
        <section className="listPane">

            <header>
                <span>{collection?.group || "Chargement"}</span>
                <h1>{activeNavigation.label}</h1>
                <p>{loading ? "…" : `${filteredItems.length} fiche(s)`}</p>
            </header>

            {loading ? (
                <LoadingState message="Chargement des fiches..." />
            ) : (
                <div className="itemList">
                    {groups.map((group) => (
                        <div key={group.key} className="itemGroup">

                            {showGroupTitles ? <h2>{group.label}</h2> : null}

                            {group.items.map((item) => (
                                <ItemListButton
                                    key={item.id}
                                    label={item.title}
                                    selected={item.id === activeItem?.id}
                                    onClick={() => navigate(`${activeNavigation.path}/${item.slug}`)}
                                />
                            ))}

                        </div>
                    ))}

                    {groups.length === 0 ? (
                        <p className="empty">Aucune fiche dans cette base pour le moment.</p>
                    ) : null}
                </div>
            )}

        </section>
    );

}
