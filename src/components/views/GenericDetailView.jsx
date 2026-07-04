import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BlockRenderer from "../BlockRenderer";
import PropertyValue from "../PropertyValue";
import LoadingState from "../States/LoadingState";
import PageNotFoundState from "../States/PageNotFoundState";
import EmptyState from "../States/EmptyState";
import { normalizeProperty, isPropertyEmpty } from "../../utils/property";
import { disciplineRefs } from "../../utils/disciplinePowers";
import collectionNavPath from "../../utils/collectionNavPath";

function backLinkPath(activeNavigation, activeItem) {
    if (activeNavigation.view === "discipline-powers") {
        const disciplineRef = disciplineRefs(activeItem)[0];
        const disciplinePath = disciplineRef && collectionNavPath(disciplineRef.collectionKey);

        if (disciplineRef && disciplinePath) {
            return `${disciplinePath}/${disciplineRef.slug}`;
        }
    }

    return activeNavigation.path;
}

export default function GenericDetailView({ wiki }) {

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

    const properties = Object.entries(activeItem.properties || {})
        .map(([name, raw]) => [name, normalizeProperty(raw)])
        .filter(([, property]) => !isPropertyEmpty(property));

    return (
        <article className="detailPane">

            <Link to={backLinkPath(activeNavigation, activeItem)} className="backLink">
                <ArrowLeft aria-hidden="true" size={16} />
                {activeNavigation.view === "discipline-powers" ? "Retour à la discipline" : "Retour à la liste"}
            </Link>

            <header>
                <span>{activeItem.collectionLabel}</span>
                <h1>{activeItem.title}</h1>
            </header>

            {properties.length > 0 ? (
                <dl className="properties">
                    {properties.map(([name, property]) => (
                        <div key={name}>
                            <dt>{name}</dt>
                            <dd><PropertyValue property={property} /></dd>
                        </div>
                    ))}
                </dl>
            ) : null}

            <div className="contentBlocks">
                {(activeItem.content || []).map((block, index) => (
                    <BlockRenderer key={`${block.type}-${index}`} block={block} />
                ))}
            </div>

        </article>
    );

}
