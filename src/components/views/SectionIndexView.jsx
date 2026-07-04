import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import LoadingState from "../States/LoadingState";

export default function SectionIndexView({ wiki }) {

    const { activeNavigation } = wiki.navigation;
    const { computed } = wiki.collections;
    const { loading } = computed;

    const isGrouped = activeNavigation.view === "merits-flaws";

    const groups = isGrouped
        ? computed.activeCollections
        : computed.activeCollections.slice(0, 1);

    const total = groups.reduce((count, group) => count + group.items.length, 0);

    return (
        <section className="pageView indexView">

            <span className="eyebrow">Règles</span>
            <h1>{activeNavigation.label}</h1>

            {!loading ? (
                <p className="indexIntro">
                    Voici la liste {isGrouped ? "des atouts et handicaps" : `des ${activeNavigation.label.toLowerCase()}`} de la chronique
                    {total ? ` (${total} fiche${total > 1 ? "s" : ""})` : ""}.
                </p>
            ) : null}

            {loading ? (
                <LoadingState message="Chargement..." />
            ) : (
                groups.map(group => (
                    <div key={group.key} className="indexGroup">

                        {isGrouped ? <h2>{group.label}</h2> : null}

                        <div className="indexGrid">
                            {group.items.map(item => (
                                <Link key={item.id} to={`${activeNavigation.path}/${item.slug}`} className="indexCard">
                                    <FileText aria-hidden="true" size={18} />
                                    <span>{item.title}</span>
                                </Link>
                            ))}

                            {group.items.length === 0 ? (
                                <p className="empty">Aucune fiche dans cette base pour le moment.</p>
                            ) : null}
                        </div>

                    </div>
                ))
            )}

        </section>
    );

}
