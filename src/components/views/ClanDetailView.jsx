import ContentBlocks from "../ContentBlocks";
import RelatedGroups from "../RelatedGroups";
import ItemFlags from "../ItemFlags";
import DetailShell from "../DetailShell";
import ClanEmblem from "../ClanEmblem";

// Le nom "Discplines" reprend une coquille du champ Notion : le libellé
// affiché, lui, reste correctement orthographié. Les Atouts/Handicaps de
// clan s'ouvrent en popup (modal) plutôt que de naviguer, pour une
// consultation rapide sans quitter la fiche du Clan ; seul le Coût y est
// affiché (Type/Clan/Lignées sont déjà évidents depuis ce contexte).
const MODAL_STAT_FIELDS = [{ label: "Coût", key: "Coût" }];

const RELATED_GROUPS = [
    { key: "Discplines", label: "Disciplines" },
    { key: "Atouts de clan", label: "Atouts de clan", modal: true, modalStatFields: MODAL_STAT_FIELDS },
    { key: "Handicaps de Clan", label: "Handicaps de clan", modal: true, modalStatFields: MODAL_STAT_FIELDS },
    { key: "Lignées", label: "Lignées" },
];

export default function ClanDetailView({ wiki }) {

    const { activeNavigation } = wiki.navigation;

    return (
        <DetailShell
            wiki={wiki}
            backPath={activeNavigation.path}
            emblem={(item) => <ClanEmblem slug={item.slug} title={item.title} />}
        >
            {(activeItem) => (
                <>
                    <ItemFlags
                        needsApproval={activeItem.properties?.Approbation?.value === true}
                        full={activeItem.properties?.Complet?.value === true}
                    />

                    <ContentBlocks content={activeItem.content} manifest={wiki.manifest} />

                    <RelatedGroups item={activeItem} groups={RELATED_GROUPS} manifest={wiki.manifest} />
                </>
            )}
        </DetailShell>
    );

}
