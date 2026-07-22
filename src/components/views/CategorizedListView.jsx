import { useNavigate } from "react-router-dom";
import ItemListButton from "../ItemListButton";
import ListPaneHeader from "../ListPaneHeader";
import LoadingState from "../States/LoadingState";
import { applyGroupFilter } from "../../utils/groupFilter";
import groupByCategory from "../../utils/groupByCategory";

/**
 * Liste d'une collection groupée visuellement par une propriété select
 * (ex. les Règles par Catégorie), plutôt qu'une liste plate. Les groupes
 * sont triés par ordre alphabétique (voir `groupByCategory`) ; seules
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

    const groups = groupByCategory(filteredItems, groupProperty);

    return (
        <section className="listPane">

            <ListPaneHeader
                group={collection?.group}
                label={activeNavigation.label}
                loading={loading}
                count={filteredItems.length}
            />

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
