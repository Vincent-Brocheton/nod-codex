import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BlockRenderer from "../BlockRenderer";
import StatBlock from "../StatBlock";
import LoadingState from "../States/LoadingState";
import PageNotFoundState from "../States/PageNotFoundState";
import EmptyState from "../States/EmptyState";
import { itemNiveau, powersForDiscipline } from "../../utils/disciplinePowers";
import collectionNavPath from "../../utils/collectionNavPath";

const STAT_FIELDS = [
    { label: "Focus principal", key: "Spécialité 1" },
    { label: "Focus secondaire", key: "Spécialité 2" },
    { label: "Jet d'attaque", key: "Jet d'attaque", separator: " + " },
    { label: "Jet de défense", key: "Jet de défense", separator: " + " },
];

const POWER_GROUPS = [
    { key: "pouvoirs", label: "Pouvoirs" },
    { key: "pouvoirs-anciens", label: "Pouvoirs d'Anciens" },
];

function levelLabel(item) {
    const value = itemNiveau(item);
    return Number.isFinite(value) ? value : "?";
}

export default function DisciplineDetailView({ wiki }) {

    const { activeItem, pageNotFound, loading } = wiki.collections.computed;
    const { loadedCollections } = wiki.collections;
    const { activeNavigation } = wiki.navigation;

    if (wiki.loading || loading) {
        return <LoadingState />;
    }

    if (pageNotFound) {
        return <PageNotFoundState />;
    }

    if (!activeItem) {
        return <EmptyState />;
    }

    const powersPath = collectionNavPath("pouvoirs");

    const groups = POWER_GROUPS.map(({ key, label }) => ({
        key,
        label,
        items: powersForDiscipline(loadedCollections[key], activeItem.slug),
    }));

    return (
        <article className="detailPane disciplineDetail">

            <Link to={activeNavigation.path} className="backLink">
                <ArrowLeft aria-hidden="true" size={16} />
                Retour à la liste
            </Link>

            <header>
                <span>{activeItem.collectionLabel}</span>
                <h1>{activeItem.title}</h1>
            </header>

            <StatBlock item={activeItem} fields={STAT_FIELDS} />

            <div className="contentBlocks">
                {(activeItem.content || []).map((block, index) => (
                    <BlockRenderer key={`${block.type}-${index}`} block={block} />
                ))}
            </div>

            <div className="relatedGroups">
                {groups.map((group) => (
                    <section key={group.key} className="relatedGroup">

                        <h2>{group.label}</h2>

                        {group.items.length === 0 ? (
                            <p className="empty">Aucun pouvoir dans cette catégorie.</p>
                        ) : (
                            <div className="relatedList">
                                {group.items.map((item) => {
                                    const content = (
                                        <>
                                            <span className="powerLevel">{levelLabel(item)}</span>
                                            <span>{item.title}</span>
                                        </>
                                    );

                                    return powersPath ? (
                                        <Link key={item.id} to={`${powersPath}/${item.slug}`} className="relatedRow">
                                            {content}
                                        </Link>
                                    ) : (
                                        <span key={item.id} className="relatedRow">
                                            {content}
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                    </section>
                ))}
            </div>

        </article>
    );

}
