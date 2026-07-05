import { Link } from "react-router-dom";
import AppIcon from "../AppIcon";
import LoadingState from "../States/LoadingState";
import { applyGroupFilter } from "../../utils/groupFilter";

export default function SectionIndexView({ wiki }) {

    const { activeNavigation } = wiki.navigation;
    const { computed } = wiki.collections;
    const { loading } = computed;

    const groups = computed.activeCollections.slice(0, 1).map((group) => ({
        ...group,
        items: applyGroupFilter(group.items, activeNavigation.groupFilter),
    }));

    const total = groups.reduce((count, group) => count + group.items.length, 0);
    const description = groups[0]?.description?.trim();

    return (
        <section className="pageView indexView">

            <header className="indexHero">
                <span className="indexHeroIcon">
                    <AppIcon name={activeNavigation.icon} size={26} />
                </span>

                <div>
                    <span className="eyebrow">Règles</span>
                    <h1>{activeNavigation.label}</h1>
                </div>
            </header>

            {!loading ? (
                <p className="indexIntro">
                    {description || (
                        <>
                            Voici la liste des {activeNavigation.label.toLowerCase()} de la chronique
                            {total ? ` (${total} fiche${total > 1 ? "s" : ""})` : ""}.
                        </>
                    )}
                </p>
            ) : null}

            {loading ? (
                <LoadingState message="Chargement..." />
            ) : (
                groups.map(group => (
                    <div key={group.key} className="indexGroup">

                        <ul className="indexList">
                            {group.items.map(item => (
                                <li key={item.id}>
                                    <Link to={`${activeNavigation.path}/${item.slug}`} className="indexListItem">
                                        <AppIcon name={activeNavigation.icon} size={16} aria-hidden="true" />
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            ))}

                            {group.items.length === 0 ? (
                                <p className="empty">Aucune fiche dans cette base pour le moment.</p>
                            ) : null}
                        </ul>

                    </div>
                ))
            )}

        </section>
    );

}
