import { useNavigate } from "react-router-dom";
import ItemListButton from "../ItemListButton";
import LoadingState from "../States/LoadingState";

function ItemList({
    wiki,
}) {
    const navigate = useNavigate();
    const {collections, navigation} = wiki;
    const {computed} = collections;
    const { activeCollections, visibleItems, loading } = computed;
    const activeCollection = activeCollections[0];
    const { activeNavigation } = navigation;
    return (<section className="listPane">
        <header>
            <span>{activeCollection?.group || "Chargement"}</span>
            <h1>{activeCollection?.label || "Base"}</h1>
            <p>{loading ? "…" : `${visibleItems.length} fiche(s)`}</p>
        </header>

        {loading ? (
            <LoadingState message="Chargement des fiches..." />
        ) : (
            <div className="itemList">
                {visibleItems.map((item) => (
                    <ItemListButton
                        key={item.id}
                        label={item.title}
                        selected={item.id === computed.activeItem?.id}
                        onClick={() => navigate(`${activeNavigation.path}/${item.slug}`)}
                    />
                ))}
                {visibleItems.length === 0 ? <p className="empty">Aucune fiche dans cette base pour le moment.</p> : null}
            </div>
        )}
    </section>);
}

export default ItemList;
