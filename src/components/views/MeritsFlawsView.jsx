import GroupedRuleView from "./GroupedRuleView";

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
        />
    );
}
