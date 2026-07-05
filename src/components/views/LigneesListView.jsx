import { useNavigate } from "react-router-dom";
import ItemListButton from "../ItemListButton";
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
            <header>
                <span>{activeCollection?.group || "Chargement"}</span>
                <h1>{activeCollection?.label || "Base"}</h1>
                <p>{loading ? "…" : `${items.length} fiche(s)`}</p>
            </header>

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
                        />
                    ))}
                    {items.length === 0 ? <p className="empty">Aucune fiche dans cette base pour le moment.</p> : null}
                </div>
            )}
        </section>
    );

}
