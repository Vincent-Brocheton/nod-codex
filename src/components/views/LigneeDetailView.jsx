import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ContentBlocks from "../ContentBlocks";
import RelatedGroups from "../RelatedGroups";
import ItemFlags from "../ItemFlags";
import DetailShell from "../DetailShell";
import collectionNavPath from "../../utils/collectionNavPath";
import { getCollection } from "../../services/wikiServices";

// Le nom "Discplines" reprend une coquille du champ Notion : le libellé
// affiché, lui, reste correctement orthographié. Les Atouts/Handicaps
// s'ouvrent en popup (modal), comme sur la fiche Clan, avec seulement le
// Coût affiché (Type/Clan/Lignées sont déjà évidents depuis ce contexte).
const MODAL_STAT_FIELDS = [{ label: "Coût", key: "Coût" }];

const RELATED_GROUPS = [
    { key: "Discplines", label: "Disciplines" },
    { key: "Atouts", label: "Atouts", modal: true, modalStatFields: MODAL_STAT_FIELDS },
    { key: "Handicaps", label: "Handicaps", modal: true, modalStatFields: MODAL_STAT_FIELDS },
    { key: "Mystères", label: "Mystères" },
];

export default function LigneeDetailView({ wiki }) {

    const { activeItem } = wiki.collections.computed;

    const clanRef = activeItem?.properties?.Clan?.type === "relation"
        ? activeItem.properties.Clan.value[0]
        : null;
    const clanPath = clanRef && collectionNavPath(clanRef.collectionKey);
    const backPath = clanRef && clanPath ? `${clanPath}/${clanRef.slug}` : "/clans";

    // Les lignées n'ont pas leur propre relation "Mystères" côté Notion :
    // on reprend celle de leur clan parent (chargé à la demande, comme les
    // popups Atouts/Handicaps), une lignée partageant les mystères de son
    // clan.
    const [clanMysteres, setClanMysteres] = useState([]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setClanMysteres([]);
        if (!clanRef) return;

        const config = wiki.manifest.collections.find((entry) => entry.key === clanRef.collectionKey);
        if (!config) return;

        let cancelled = false;

        getCollection(config.file).then((collection) => {
            if (cancelled) return;

            const clan = collection.items.find((entry) => entry.slug === clanRef.slug);
            const mysteres = clan?.properties?.["Mystères"];
            setClanMysteres(mysteres?.type === "relation" ? mysteres.value : []);
        });

        return () => {
            cancelled = true;
        };
    }, [wiki.manifest, clanRef]);

    return (
        <DetailShell
            wiki={wiki}
            backPath={backPath}
            backLabel="Retour au clan"
        >
            {(item) => {
                const itemWithClanMysteres = {
                    ...item,
                    properties: {
                        ...item.properties,
                        "Mystères": { type: "relation", value: clanMysteres },
                    },
                };

                return (
                    <>
                        <ItemFlags
                            needsApproval={item.properties?.Approbation?.value === true}
                            full={item.properties?.Complet?.value === true}
                        />

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

                        <RelatedGroups item={itemWithClanMysteres} groups={RELATED_GROUPS} manifest={wiki.manifest} />
                    </>
                );
            }}
        </DetailShell>
    );

}
