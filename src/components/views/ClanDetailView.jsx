import BlockRenderer from "../BlockRenderer";
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
                    <div className="contentBlocks">
                        {(activeItem.content || []).map((block, index) => (
                            <BlockRenderer key={`${block.type}-${index}`} block={block} />
                        ))}
                    </div>

                    <RelatedGroups item={activeItem} groups={RELATED_GROUPS} />
                </>
            )}
        </DetailShell>
    );

}
