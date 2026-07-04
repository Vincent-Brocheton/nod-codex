import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MeritsFlawsView({ wiki }) {

    const navigate = useNavigate();
    const { loadedCollections, computed } = wiki.collections;
    const { activeNavigation } = wiki.navigation;

    const collections = activeNavigation.collections
        .map(key => loadedCollections[key])
        .filter(Boolean);

    const total = collections.reduce((count, collection) => count + collection.items.length, 0);

    return (
        <section className="listPane">

            <header>
                <span>Règles</span>
                <h1>{activeNavigation.label}</h1>
                <p>{total} fiche(s)</p>
            </header>

            <div className="itemList">
                {collections.map(collection => (
                    <div key={collection.key} className="itemGroup">

                        <h2>{collection.label}</h2>

                        {collection.items.map(item => (
                            <button
                                key={item.id}
                                className={item.id === computed.activeItem?.id ? "selected" : ""}
                                onClick={() => navigate(`${activeNavigation.path}/${item.slug}`)}
                            >
                                <FileText aria-hidden="true" size={17} />
                                <span>{item.title}</span>
                            </button>
                        ))}

                        {collection.items.length === 0 ? (
                            <p className="empty">Aucune fiche dans cette base pour le moment.</p>
                        ) : null}

                    </div>
                ))}
            </div>

        </section>
    );

}
