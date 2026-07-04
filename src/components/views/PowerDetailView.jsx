import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BlockRenderer from "../BlockRenderer";
import StatBlock from "../StatBlock";
import LoadingState from "../States/LoadingState";
import PageNotFoundState from "../States/PageNotFoundState";
import EmptyState from "../States/EmptyState";
import { disciplineRefs } from "../../utils/disciplinePowers";
import collectionNavPath from "../../utils/collectionNavPath";

const STAT_FIELDS = [
    { label: "Niveau", key: "Niveau" },
    { label: "Focus", key: "Focus" },
    { label: "Type d'action", key: "Type d'action" },
    { label: "Durée", key: "Durée" },
    { label: "Jet d'attaque", key: "Jet d'attaque" },
    { label: "Jet de défense", key: "Jet de défense" },
    { label: "Coût en sang", tokens: ["cout", "sang"] },
];

export default function PowerDetailView({ wiki }) {

    const { activeItem, pageNotFound, loading } = wiki.collections.computed;

    if (wiki.loading || loading) {
        return <LoadingState />;
    }

    if (pageNotFound) {
        return <PageNotFoundState />;
    }

    if (!activeItem) {
        return <EmptyState />;
    }

    const discipline = disciplineRefs(activeItem)[0];
    const disciplinePath = discipline && collectionNavPath(discipline.collectionKey);
    const backPath = discipline && disciplinePath
        ? `${disciplinePath}/${discipline.slug}`
        : "/disciplines";

    return (
        <article className="detailPane">

            <Link to={backPath} className="backLink">
                <ArrowLeft aria-hidden="true" size={16} />
                Retour à la discipline
            </Link>

            <header>
                <span>{activeItem.collectionLabel}</span>
                <h1>{activeItem.title}</h1>
            </header>

            <StatBlock item={activeItem} fields={STAT_FIELDS} />

            {discipline ? (
                <p className="metaLine">
                    Discipline :{" "}
                    {disciplinePath ? (
                        <Link to={`${disciplinePath}/${discipline.slug}`} className="relationChip">
                            {discipline.title}
                        </Link>
                    ) : (
                        <span className="relationChip">{discipline.title}</span>
                    )}
                </p>
            ) : null}

            <div className="contentBlocks">
                {(activeItem.content || []).map((block, index) => (
                    <BlockRenderer key={`${block.type}-${index}`} block={block} />
                ))}
            </div>

        </article>
    );

}
