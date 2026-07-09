import ContentBlocks from "../ContentBlocks";
import RelatedGroups from "../RelatedGroups";
import DetailShell from "../DetailShell";

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
        <DetailShell wiki={wiki} backPath={activeNavigation.path}>
            {(activeItem) => (
                <>
                    <ContentBlocks content={activeItem.content} />

                    <RelatedGroups item={activeItem} groups={RELATED_GROUPS} manifest={wiki.manifest} />
                </>
            )}
        </DetailShell>
    );

}
