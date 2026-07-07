import ContentBlocks from "../ContentBlocks";
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
                    <ContentBlocks content={activeItem.content} />

                    <RelatedGroups item={activeItem} groups={RELATED_GROUPS} />
                </>
            )}
        </DetailShell>
    );

}
