import ContentBlocks from "../ContentBlocks";
import RelatedGroups from "../RelatedGroups";
import DetailShell from "../DetailShell";

// Le nom "Discplines" reprend une coquille du champ Notion : le libellé
// affiché, lui, reste correctement orthographié.
const RELATED_GROUPS = [
    { key: "Discplines", label: "Disciplines" },
    { key: "Atouts de clan", label: "Atouts de clan" },
    { key: "Handicaps de Clan", label: "Handicaps de clan" },
    { key: "Lignées", label: "Lignées" },
];

export default function ClanDetailView({ wiki }) {

    const { activeNavigation } = wiki.navigation;

    return (
        <DetailShell wiki={wiki} backPath={activeNavigation.path}>
            {(activeItem) => (
                <>
                    <ContentBlocks content={activeItem.content} />

                    <RelatedGroups item={activeItem} groups={RELATED_GROUPS} />
                </>
            )}
        </DetailShell>
    );

}
