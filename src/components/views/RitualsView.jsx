import GroupedRuleView from "./GroupedRuleView";

const LEVELS = [1, 2, 3, 4, 5];

// Le niveau est déjà indiqué dans le titre du groupe ("Niveau X"), inutile
// de le répéter sur chaque rituel affiché en dessous.
const STAT_FIELDS = [
    { label: "Temps de préparation", key: "Temps de préparation" },
    { label: "Coût en sang", tokens: ["cout", "sang"] },
];

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
            itemStatFields={STAT_FIELDS}
        />
    );
}
