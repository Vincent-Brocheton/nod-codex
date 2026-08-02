import GroupedRuleView from "./GroupedRuleView";
import collectionNavPath from "../../utils/collectionNavPath";
import { normalizeProperty } from "../../utils/property";

const SINGLE_STAT_FIELDS = [
    { label: "Coût", key: "Coût" },
    { label: "Type", key: "Type" },
];

// Sur "Clan", le sous-titre indique déjà le clan : sans lui, le Coût
// n'apparaîtrait nulle part tant que la fiche n'est pas dépliée. Affiché en
// évidence dans l'en-tête repliée, comme la Restriction sur les Rituels.
const COUT_HIGHLIGHT_FIELD = { label: "Coût", key: "Coût" };

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

// Texte de la puce de filtre par coût (ex. "2 points"), plus court que le
// sous-titre complet qui répète déjà le nom de la collection.
function coutFilterLabel(value) {
    if (!Number.isFinite(value)) return "Sans coût";

    return `${value} point${value > 1 ? "s" : ""}`;
}

function relationRef(item, key) {
    const property = item.properties?.[key];
    return property?.type === "relation" ? property.value[0] : null;
}

function clanOf(item) {
    return relationRef(item, "Clan")?.title || null;
}

// Sous-titre entre les fiches d'un même clan sur la catégorie "Clan".
function clanSubGroupLabel(value, collectionLabel) {
    return `${collectionLabel} du clan ${value}`;
}

// Trie par clan puis par coût : sur la catégorie "Clan", regroupe d'abord
// par clan (voir `clanSubGroup`) ; sur les autres catégories, `clanOf` vaut
// toujours null (ces fiches en sont exclues par `isVisibleForGroup`) et le
// tri revient donc au comportement d'origine, par coût.
function byClanThenCoutThenAlpha(a, b) {
    const clanA = clanOf(a);
    const clanB = clanOf(b);
    if (clanA !== clanB) return (clanA || "").localeCompare(clanB || "", "fr");
    return byCoutThenAlpha(a, b);
}

function subGroupFor(typeValue) {
    return typeValue === "Clan"
        ? { key: clanOf, label: clanSubGroupLabel, filterable: true }
        : { key: coutOf, label: coutSubGroupLabel, filterable: true, filterLabel: coutFilterLabel };
}

function highlightFieldFor(typeValue) {
    return typeValue === "Clan" ? COUT_HIGHLIGHT_FIELD : undefined;
}

// Sur les catégories générales (Camarilla, Sabbat, Général, Anarch'), un
// atout/handicap lié à un Clan ou une Lignée n'apparaît que sur la fiche de
// ce Clan/cette Lignée, pas ici. Sur la catégorie "Clan", à l'inverse, seules
// les fiches dont le Clan est renseigné apparaissent : celles liées
// uniquement à une Lignée restent sur leur fiche Lignée, et celles sans
// aucune relation appartiennent à un clan non joué dans ce GN (données
// Notion incomplètes côté clan, pas encore de fiche Clan à rattacher).
function isVisibleForGroup(item, typeValue) {
    if (typeValue === "Clan") return Boolean(relationRef(item, "Clan"));
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

// Icône + accroche par type, pour les cartes enrichies de l'index (voir
// `groupCardMeta` dans GroupedRuleView).
const TYPE_META = {
    Camarilla: { icon: "crown", describe: (label) => `${label} liés à la Camarilla et à ses traditions.` },
    Sabbat: { icon: "cross", describe: (label) => `${label} liés au Sabbat et à ses doctrines.` },
    "Général": { icon: "flower", describe: (label) => `${label} communs à tous les vampires.` },
    "Anarch'": { icon: "anarchy", describe: (label) => `${label} liés aux Anarchs et à leur philosophie.` },
    Clan: { icon: "shield", describe: (label) => `${label} propres à un clan en particulier.` },
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
    )].sort((a, b) => a.localeCompare(b, "fr"));

    return (
        <GroupedRuleView
            wiki={wiki}
            collectionKey={collectionKey}
            groupValue={groupValue}
            propertyName="Type"
            groups={types}
            formatGroupLabel={(value) => value}
            introText="Personnalisez votre personnage grâce à des avantages uniques et des faiblesses marquantes."
            emptyMessage="Aucune fiche de ce type pour le moment."
            itemFilter={isVisibleForGroup}
            itemSort={byClanThenCoutThenAlpha}
            itemSubGroup={subGroupFor}
            itemHighlightField={highlightFieldFor}
            hideGroupedProperties
            showGroupBadge={false}
            singleItemStatFields={SINGLE_STAT_FIELDS}
            singleItemRelatedGroups={RELATED_GROUPS}
            resolveBackPath={resolveBackPath}
            groupHeadingIcon={typeHeadingIcon}
            groupCardMeta={TYPE_META}
            collapsible
        />
    );
}
