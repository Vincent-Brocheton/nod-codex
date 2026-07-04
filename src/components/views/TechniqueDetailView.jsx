import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BlockRenderer from "../BlockRenderer";
import RelatedGroups from "../RelatedGroups";
import LoadingState from "../States/LoadingState";
import PageNotFoundState from "../States/PageNotFoundState";
import EmptyState from "../States/EmptyState";

const RELATED_GROUPS = [
    { key: "Disciplines", label: "Disciplines" },
];

export default function TechniqueDetailView({ wiki }) {

    const { activeItem, pageNotFound, loading } = wiki.collections.computed;
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

    return (
        <article className="detailPane">

            <Link to={activeNavigation.path} className="backLink">
                <ArrowLeft aria-hidden="true" size={16} />
                Retour à la liste
            </Link>

            <header>
                <span>{activeItem.collectionLabel}</span>
                <h1>{activeItem.title}</h1>
            </header>

            <div className="contentBlocks">
                {(activeItem.content || []).map((block, index) => (
                    <BlockRenderer key={`${block.type}-${index}`} block={block} />
                ))}
            </div>

            <RelatedGroups item={activeItem} groups={RELATED_GROUPS} />

        </article>
    );

}
