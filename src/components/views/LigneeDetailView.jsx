import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BlockRenderer from "../BlockRenderer";
import RelatedGroups from "../RelatedGroups";
import LoadingState from "../States/LoadingState";
import PageNotFoundState from "../States/PageNotFoundState";
import EmptyState from "../States/EmptyState";
import collectionNavPath from "../../utils/collectionNavPath";

// Le nom "Discplines" reprend une coquille du champ Notion : le libellé
// affiché, lui, reste correctement orthographié.
const RELATED_GROUPS = [
    { key: "Discplines", label: "Disciplines" },
    { key: "Atouts", label: "Atouts" },
    { key: "Handicaps", label: "Handicaps" },
];

export default function LigneeDetailView({ wiki }) {

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

    const clanRef = activeItem.properties?.Clan?.type === "relation"
        ? activeItem.properties.Clan.value[0]
        : null;
    const clanPath = clanRef && collectionNavPath(clanRef.collectionKey);
    const backPath = clanRef && clanPath ? `${clanPath}/${clanRef.slug}` : "/clans";

    return (
        <article className="detailPane">

            <Link to={backPath} className="backLink">
                <ArrowLeft aria-hidden="true" size={16} />
                Retour au clan
            </Link>

            <header>
                <span>{activeItem.collectionLabel}</span>
                <h1>{activeItem.title}</h1>
            </header>

            {clanRef ? (
                <p className="metaLine">
                    Clan :{" "}
                    {clanPath ? (
                        <Link to={`${clanPath}/${clanRef.slug}`} className="relationChip">
                            {clanRef.title}
                        </Link>
                    ) : (
                        <span className="relationChip">{clanRef.title}</span>
                    )}
                </p>
            ) : null}

            <div className="contentBlocks">
                {(activeItem.content || []).map((block, index) => (
                    <BlockRenderer key={`${block.type}-${index}`} block={block} />
                ))}
            </div>

            <RelatedGroups item={activeItem} groups={RELATED_GROUPS} />

        </article>
    );

}
