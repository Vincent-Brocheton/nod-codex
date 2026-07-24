import ContentBlocks from "../ContentBlocks";
import RelatedGroups from "../RelatedGroups";
import StatBlock from "../StatBlock";
import DetailShell from "../DetailShell";

// "Prerequis" est un multi_select Notion (discipline + niveau requis, ex.
// "Chimérie •"), affiché comme une formule plutôt qu'une liste à puces.
const STAT_FIELDS = [
    { label: "Prérequis", key: "Prerequis", separator: ", " },
];

const RELATED_GROUPS = [
    { key: "Disciplines", label: "Disciplines" },
];

export default function TechniqueDetailView({ wiki }) {

    const { activeNavigation } = wiki.navigation;

    return (
        <DetailShell wiki={wiki} backPath={activeNavigation.path}>
            {(activeItem) => (
                <>
                    <StatBlock item={activeItem} fields={STAT_FIELDS} />

                    <ContentBlocks content={activeItem.content} manifest={wiki.manifest} />

                    <RelatedGroups item={activeItem} groups={RELATED_GROUPS} manifest={wiki.manifest} />
                </>
            )}
        </DetailShell>
    );

}
