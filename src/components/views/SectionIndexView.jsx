import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import AppIcon from "../AppIcon";
import ItemFlags from "../ItemFlags";
import IndexPageHeader from "../IndexPageHeader";
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

            <IndexPageHeader icon={activeNavigation.icon} label={activeNavigation.label} />

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

                        <div className="listRows">
                            {group.items.map(item => (
                                <Link key={item.id} to={`${activeNavigation.path}/${item.slug}`} className="listRow">
                                    <AppIcon name={activeNavigation.icon} size={16} aria-hidden="true" />
                                    <span className="listRowLabel">{item.title}</span>
                                    <ItemFlags
                                        needsApproval={item.properties?.Approbation?.value === true}
                                        full={item.properties?.Complet?.value === true}
                                        compact
                                    />
                                    <ChevronRight className="rowArrow" size={18} aria-hidden="true" />
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
