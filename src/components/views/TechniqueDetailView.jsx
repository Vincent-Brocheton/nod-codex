import BlockRenderer from "../BlockRenderer";
import RelatedGroups from "../RelatedGroups";
import DetailShell from "../DetailShell";

const RELATED_GROUPS = [
    { key: "Disciplines", label: "Disciplines" },
];

export default function TechniqueDetailView({ wiki }) {

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
