import GroupedRuleView from "./GroupedRuleView";
import collectionNavPath from "../../utils/collectionNavPath";
import { normalizeProperty } from "../../utils/property";

const SINGLE_STAT_FIELDS = [
    { label: "Coût", key: "Coût" },
    { label: "Type", key: "Type" },
];

const RELATED_GROUPS = [
    { key: "Clan", label: "Clan" },
    { key: "Lignées", label: "Lignées" },
];

function coutOf(item) {
    const value = Number(normalizeProperty(item.properties?.["Coût"]).value);
    return Number.isFinite(value) ? value : Infinity;
}

// Trie par coût croissant, puis alphabétiquement à coût égal.
function byCoutThenAlpha(a, b) {
    const diff = coutOf(a) - coutOf(b);
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title, "fr");
}

// Sous-titre entre les fiches d'un même coût (ex. "Atouts à 1 point"),
// affiché à la place du coût sur chaque fiche individuelle.
function coutSubGroupLabel(value, collectionLabel) {
    if (!Number.isFinite(value)) return `${collectionLabel} sans coût défini`;

    return `${collectionLabel} à ${value} point${value > 1 ? "s" : ""}`;
}

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

// Type réservé aux atouts/handicaps propres à un Clan : ils n'apparaissent
// que sur la fiche de ce Clan (via sa relation "Atouts/Handicaps de Clan"),
// jamais comme catégorie parcourable dans la liste générale.
const EXCLUDED_TYPES = ["Clan"];

// Icône + accroche par type, pour les cartes enrichies de l'index (voir
// `groupCardMeta` dans GroupedRuleView).
const TYPE_META = {
    Camarilla: { icon: "crown", describe: (label) => `${label} liés à la Camarilla et à ses traditions.` },
    Sabbat: { icon: "cross", describe: (label) => `${label} liés au Sabbat et à ses doctrines.` },
    "Général": { icon: "flower", describe: (label) => `${label} communs à tous les vampires.` },
    "Anarch'": { icon: "anarchy", describe: (label) => `${label} liés aux Anarchs et à leur philosophie.` },
};

function typeHeadingIcon(collectionKey) {
    return collectionKey === "atouts" ? "star" : "skull";
}

export default function MeritsFlawsView({ wiki, collectionKey, groupValue }) {

    const { loadedCollections } = wiki.collections;
    const { activeNavigation } = wiki.navigation;

    // Les valeurs possibles viennent de la configuration Notion (options du
    // champ "Type"), pas d'une liste fixe : on ne montre que les types
    // réellement prévus dans les bases (union Atouts + Handicaps).
    const types = [...new Set(
        activeNavigation.collections
            .flatMap(key => loadedCollections[key]?.propertyOptions?.Type || [])
    )].filter(type => !EXCLUDED_TYPES.includes(type));

    return (
        <GroupedRuleView
            wiki={wiki}
            collectionKey={collectionKey}
            groupValue={groupValue}
            propertyName="Type"
            groups={types}
            formatGroupLabel={(value) => value}
            introText="Voici les atouts et handicaps de la chronique, classés par type."
            emptyMessage="Aucune fiche de ce type pour le moment."
            itemFilter={isGeneral}
            itemSort={byCoutThenAlpha}
            itemSubGroup={{ key: coutOf, label: coutSubGroupLabel }}
            hideGroupedProperties
            showGroupBadge={false}
            singleItemStatFields={SINGLE_STAT_FIELDS}
            singleItemRelatedGroups={RELATED_GROUPS}
            resolveBackPath={resolveBackPath}
            indexBackgroundClassName="pageAreaAtouts"
            groupHeadingIcon={typeHeadingIcon}
            groupCardMeta={TYPE_META}
        />
    );
}
