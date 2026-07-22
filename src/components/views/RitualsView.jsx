import GroupedRuleView from "./GroupedRuleView";

const LEVELS = [1, 2, 3, 4, 5];

// Le niveau est déjà indiqué dans le titre du groupe ("Niveau X"), inutile
// de le répéter sur chaque rituel affiché en dessous. Chaque champ n'est
// affiché que s'il existe réellement sur la fiche (comportement par défaut
// de StatBlock), donc rien ne s'affiche pour les rituels sans Ingrédients
// par exemple.
const STAT_FIELDS = [
    { label: "Coût en sang", tokens: ["cout", "sang"] },
    { label: "Durée", key: "Durée" },
    { label: "Temps de préparation", key: "Temps de préparation" },
    { label: "Ingrédients", key: "Ingrédients" },
];

// La Restriction (qui peut lancer ce rituel) est affichée à part, dans un
// encart visible, plutôt que noyée parmi les autres propriétés.
const HIGHLIGHT_FIELD = { label: "Restriction", key: "Restriction" };

function byTitleAlpha(a, b) {
    return a.title.localeCompare(b.title, "fr");
}

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
            itemHighlightField={HIGHLIGHT_FIELD}
            itemSort={byTitleAlpha}
        />
    );
}
