import { useNavigate } from "react-router-dom";
import ItemListButton from "../ItemListButton";
import ItemFlags from "../ItemFlags";
import ListPaneHeader from "../ListPaneHeader";
import LoadingState from "../States/LoadingState";

function clanRefOf(item) {
    const property = item.properties?.Clan;
    return property?.type === "relation" ? property.value[0] : null;
}

/**
 * Liste des Lignées : quand une Lignée est ouverte, ne montre que les
 * Lignées du même Clan plutôt que la liste complète, pour rester cohérent
 * avec le contexte de navigation (on arrive ici depuis une fiche Clan).
 */
export default function LigneesListView({ wiki }) {

    const navigate = useNavigate();
    const { computed } = wiki.collections;
    const { activeNavigation } = wiki.navigation;
    const { activeCollections, visibleItems, activeItem, loading } = computed;
    const activeCollection = activeCollections[0];

    const activeClanSlug = activeItem ? clanRefOf(activeItem)?.slug : null;

    const items = activeClanSlug
        ? visibleItems.filter((item) => clanRefOf(item)?.slug === activeClanSlug)
        : visibleItems;

    return (
        <section className="listPane">
            <ListPaneHeader
                group={activeCollection?.group}
                label={activeCollection?.label}
                loading={loading}
                count={items.length}
            />

            {loading ? (
                <LoadingState message="Chargement des fiches..." />
            ) : (
                <div className="itemList">
                    {items.map((item) => (
                        <ItemListButton
                            key={item.id}
                            label={item.title}
                            selected={item.id === activeItem?.id}
                            onClick={() => navigate(`${activeNavigation.path}/${item.slug}`)}
                            badges={(
                                <ItemFlags
                                    needsApproval={item.properties?.Approbation?.value === true}
                                    full={item.properties?.Complet?.value === true}
                                    compact
                                />
                            )}
                        />
                    ))}
                    {items.length === 0 ? <p className="empty">Aucune fiche dans cette base pour le moment.</p> : null}
                </div>
            )}
        </section>
    );

}
