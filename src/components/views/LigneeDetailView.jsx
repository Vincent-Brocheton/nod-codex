import { Link } from "react-router-dom";
import ContentBlocks from "../ContentBlocks";
import RelatedGroups from "../RelatedGroups";
import DetailShell from "../DetailShell";
import collectionNavPath from "../../utils/collectionNavPath";

// Le nom "Discplines" reprend une coquille du champ Notion : le libellé
// affiché, lui, reste correctement orthographié. Les Atouts/Handicaps
// s'ouvrent en popup (modal), comme sur la fiche Clan, avec seulement le
// Coût affiché (Type/Clan/Lignées sont déjà évidents depuis ce contexte).
const MODAL_STAT_FIELDS = [{ label: "Coût", key: "Coût" }];

const RELATED_GROUPS = [
    { key: "Discplines", label: "Disciplines" },
    { key: "Atouts", label: "Atouts", modal: true, modalStatFields: MODAL_STAT_FIELDS },
    { key: "Handicaps", label: "Handicaps", modal: true, modalStatFields: MODAL_STAT_FIELDS },
];

export default function LigneeDetailView({ wiki }) {

    const { activeItem } = wiki.collections.computed;

    const clanRef = activeItem?.properties?.Clan?.type === "relation"
        ? activeItem.properties.Clan.value[0]
        : null;
    const clanPath = clanRef && collectionNavPath(clanRef.collectionKey);
    const backPath = clanRef && clanPath ? `${clanPath}/${clanRef.slug}` : "/clans";

    return (
        <DetailShell wiki={wiki} backPath={backPath} backLabel="Retour au clan">
            {(item) => (
                <>
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

                    <ContentBlocks content={item.content} manifest={wiki.manifest} />

                    <RelatedGroups item={item} groups={RELATED_GROUPS} manifest={wiki.manifest} />
                </>
            )}
        </DetailShell>
    );

}
