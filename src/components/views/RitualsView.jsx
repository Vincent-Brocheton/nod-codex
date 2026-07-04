import GroupedRuleView from "./GroupedRuleView";

const LEVELS = [1, 2, 3, 4, 5];

export default function RitualsView({ wiki, collectionKey, groupValue }) {
    return (
        <GroupedRuleView
            wiki={wiki}
            collectionKey={collectionKey}
            groupValue={groupValue}
            propertyName="Niveau"
            groups={LEVELS}
            formatGroupLabel={(value) => `Niveau ${value}`}
            introText="Voici les rituels de la chronique, classés par catégorie et par niveau (1 à 5)."
            emptyMessage="Aucun rituel à ce niveau pour le moment."
        />
    );
}
