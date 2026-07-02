import { FileText } from "lucide-react";

function ItemList({
    wiki,
}) {
    const {collections} = wiki;
    const {
        computed,
        actions,
    } = collections;
    const { activeCollections, visibleItems } = computed;
    const activeCollection = activeCollections[0];
    return (<section className="listPane">
        <header>
            <span>{activeCollection?.group || "Chargement"}</span>
            <h1>{activeCollection?.label || "Base"}</h1>
            <p>{visibleItems.length} fiche(s)</p>
        </header>

        <div className="itemList">
            {visibleItems.map((item) => (
                <button
                    key={item.id}
                    className={item.id === computed.activeItem?.id ? "selected" : ""}
                    onClick={() =>
                        actions.openPage(item)
                    }
                >
                    <FileText aria-hidden="true" size={17} />
                    <span>{item.title}</span>
                </button>
            ))}
            {visibleItems.length === 0 ? <p className="empty">Aucune fiche dans cette base pour le moment.</p> : null}
        </div>
    </section>);
}

export default ItemList;