import { Link } from "react-router-dom";
import BlockRenderer from "../BlockRenderer";
import LoadingState from "../States/LoadingState";
import PageNotFoundState from "../States/PageNotFoundState";
import EmptyState from "../States/EmptyState";
import { normalizeProperty, isPropertyEmpty } from "../../utils/property";
import { itemNiveau, powersForDiscipline } from "../../utils/disciplinePowers";
import collectionNavPath from "../../utils/collectionNavPath";

const STATS = [
    { key: "Spécialité 1", label: "Focus principal" },
    { key: "Spécialité 2", label: "Focus secondaire" },
    { key: "Jet d'attaque", label: "Jet d'attaque" },
    { key: "Jet de défense", label: "Jet de défense" },
];

const POWER_GROUPS = [
    { key: "pouvoirs", label: "Pouvoirs" },
    { key: "pouvoirs-anciens", label: "Pouvoirs d'Anciens" },
];

function statValue(item, key) {
    const property = normalizeProperty(item?.properties?.[key]);
    if (isPropertyEmpty(property)) return "—";
    if (Array.isArray(property.value)) return property.value.join(" / ");
    return String(property.value);
}

function levelLabel(item) {
    const value = itemNiveau(item);
    return Number.isFinite(value) ? value : "?";
}

export default function DisciplineDetailView({ wiki }) {

    const { activeItem, pageNotFound, loading } = wiki.collections.computed;
    const { loadedCollections } = wiki.collections;

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

            <header>
                <span>{activeItem.collectionLabel}</span>
                <h1>{activeItem.title}</h1>
            </header>

            <div className="disciplineStats">
                {STATS.map(({ key, label }) => (
                    <div key={key} className="statCard">
                        <span className="statLabel">{label}</span>
                        <strong>{statValue(activeItem, key)}</strong>
                    </div>
                ))}
            </div>

            <div className="contentBlocks">
                {(activeItem.content || []).map((block, index) => (
                    <BlockRenderer key={`${block.type}-${index}`} block={block} />
                ))}
            </div>

            <div className="disciplinePowers">
                {groups.map((group) => (
                    <section key={group.key} className="powerGroup">

                        <h2>{group.label}</h2>

                        {group.items.length === 0 ? (
                            <p className="empty">Aucun pouvoir dans cette catégorie.</p>
                        ) : (
                            <div className="powerList">
                                {group.items.map((item) => {
                                    const content = (
                                        <>
                                            <span className="powerLevel">{levelLabel(item)}</span>
                                            <span>{item.title}</span>
                                        </>
                                    );

                                    return powersPath ? (
                                        <Link key={item.id} to={`${powersPath}/${item.slug}`} className="powerRow">
                                            {content}
                                        </Link>
                                    ) : (
                                        <span key={item.id} className="powerRow">
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
