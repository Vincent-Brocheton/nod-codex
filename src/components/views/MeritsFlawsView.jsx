import GroupedRuleView from "./GroupedRuleView";
import collectionNavPath from "../../utils/collectionNavPath";

const STAT_FIELDS = [
    { label: "Coût", key: "Coût" },
];

const RELATED_GROUPS = [
    { key: "Clan", label: "Clan" },
    { key: "Lignées", label: "Lignées" },
];

function relationRef(item, key) {
    const property = item.properties?.[key];
    return property?.type === "relation" ? property.value[0] : null;
}

// Un atout/handicap lié à un Clan ou une Lignée n'apparaît que sur la fiche
// de ce Clan/cette Lignée, pas dans la liste générale des Atouts & Handicaps.
function isGeneral(item) {
    return !relationRef(item, "Clan") && !relationRef(item, "Lignées");
}

// Depuis la fiche d'un Atout/Handicap ouvert par son slug (lien depuis un
// Clan ou une Lignée), on revient vers ce Clan/cette Lignée plutôt que vers
// la liste générale.
function resolveBackPath(item) {
    const ref = relationRef(item, "Clan") || relationRef(item, "Lignées");
    if (!ref) return null;

    const path = collectionNavPath(ref.collectionKey);
    return path ? `${path}/${ref.slug}` : null;
}

export default function MeritsFlawsView({ wiki, collectionKey, groupValue }) {

    const { loadedCollections } = wiki.collections;
    const { activeNavigation } = wiki.navigation;

    // Les valeurs possibles viennent de la configuration Notion (options du
    // champ "Coût"), pas d'une plage fixe : on ne montre que les coûts
    // réellement prévus dans les bases.
    const costs = [...new Set(
        activeNavigation.collections
            .flatMap(key => loadedCollections[key]?.propertyOptions?.["Coût"] || [])
            .map(Number)
            .filter(Number.isFinite)
    )].sort((a, b) => a - b);

    return (
        <GroupedRuleView
            wiki={wiki}
            collectionKey={collectionKey}
            groupValue={groupValue}
            propertyName="Coût"
            groups={costs}
            formatGroupLabel={(value) => `${value} point${Number(value) > 1 ? "s" : ""}`}
            introText="Voici les atouts et handicaps de la chronique, classés par coût en points."
            emptyMessage="Aucune fiche à ce coût pour le moment."
            itemFilter={isGeneral}
            hideGroupedProperties
            singleItemStatFields={STAT_FIELDS}
            singleItemRelatedGroups={RELATED_GROUPS}
            resolveBackPath={resolveBackPath}
        />
    );
}
