import { useEffect, useMemo, useState } from "react";
import GroupedRuleView from "./GroupedRuleView";
import collectionNavPath from "../../utils/collectionNavPath";
import { normalizeProperty } from "../../utils/property";
import { getCollection } from "../../services/wikiServices";

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

// Certains atouts/handicaps ne sont propres qu'à une lignée (pas au clan
// entier) : côté Notion, ils ne portent donc qu'une relation "Lignées", pas
// de relation "Clan" directe. Ils doivent malgré tout apparaître dans la
// même liste que les atouts de leur clan (ex. "Lignée : Croisé" avec les
// atouts Ventrue) : à défaut de Clan direct, on résout le clan via la fiche
// de la lignée (`ligneeClanMap`, slug de lignée -> nom de clan).
function clanOf(item, ligneeClanMap) {
    const direct = relationRef(item, "Clan")?.title;
    if (direct) return direct;

    const ligneeRef = relationRef(item, "Lignées");
    return (ligneeRef && ligneeClanMap?.get(ligneeRef.slug)) || null;
}

// Sous-titre entre les fiches d'un même clan sur la catégorie "Clan".
function clanSubGroupLabel(value, collectionLabel) {
    return `${collectionLabel} du clan ${value}`;
}

// Trie par clan puis par coût : sur la catégorie "Clan", regroupe d'abord
// par clan (voir `clanSubGroup`) ; sur les autres catégories, `clanOf` vaut
// toujours null (ces fiches en sont exclues par `isVisibleForGroup`) et le
// tri revient donc au comportement d'origine, par coût.
function byClanThenCoutThenAlpha(ligneeClanMap) {
    return (a, b) => {
        const clanA = clanOf(a, ligneeClanMap);
        const clanB = clanOf(b, ligneeClanMap);
        if (clanA !== clanB) return (clanA || "").localeCompare(clanB || "", "fr");
        return byCoutThenAlpha(a, b);
    };
}

function subGroupFor(typeValue, ligneeClanMap) {
    return typeValue === "Clan"
        ? { key: (item) => clanOf(item, ligneeClanMap), label: clanSubGroupLabel, filterable: true }
        : { key: coutOf, label: coutSubGroupLabel, filterable: true, filterLabel: coutFilterLabel };
}

function highlightFieldFor(typeValue) {
    return typeValue === "Clan" ? COUT_HIGHLIGHT_FIELD : undefined;
}

// Une relation "Lignées" sur un atout ne veut pas dire qu'il est réservé à
// cette lignée : côté Notion, la fiche d'une lignée liste dans ses propres
// "Atouts" à la fois son atout exclusif et tous les atouts génériques de son
// clan (ex. la fiche "Croisé" liste "Aura de commandement", un atout Ventrue
// ordinaire) — la relation inverse "Lignées" apparaît alors aussi sur cet
// atout générique, sans qu'il soit exclusif à cette lignée pour autant. Le
// seul signal fiable pour "ouvert à tout le clan" est la liste "Atouts de
// clan" de la fiche Clan elle-même (`clanAtoutsMap`, nom de clan -> slugs) :
// un atout qui y figure est disponible pour tout le clan (donc rien à
// marquer, même s'il est aussi rattaché à une lignée) ; un atout qui n'y
// figure pas mais porte une relation Lignées est réservé à cette lignée.
function scopeNoteFor(item, ligneeClanMap, clanAtoutsMap) {
    const clan = clanOf(item, ligneeClanMap);
    if (clan && clanAtoutsMap?.get(clan)?.has(item.slug)) return null;

    const ligneeRef = relationRef(item, "Lignées");
    if (ligneeRef) return `Réservé à la lignée ${ligneeRef.title}`;

    if (clan) return `Réservé au clan ${clan} sans lignée`;

    return null;
}

// Sur les catégories générales (Camarilla, Sabbat, Général, Anarch'), un
// atout/handicap lié à un Clan ou une Lignée n'apparaît que sur la fiche de
// ce Clan/cette Lignée, pas ici. Sur la catégorie "Clan", à l'inverse,
// apparaissent les fiches dont le clan se résout (directement, ou via leur
// lignée grâce à `ligneeClanMap` — voir `clanOf`) ; celles dont ni l'un ni
// l'autre ne se résout appartiennent à un clan non joué dans ce GN (données
// Notion incomplètes côté clan, pas encore de fiche Clan à rattacher).
function isVisibleForGroup(item, typeValue, ligneeClanMap) {
    if (typeValue === "Clan") return Boolean(clanOf(item, ligneeClanMap));
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

    // Chargées à part (hors de `activeNavigation.collections`, qui ne couvre
    // que Atouts + Handicaps ici) pour résoudre le clan des atouts propres à
    // une lignée sans clan direct (`clanOf`) et savoir quels atouts sont
    // ouverts à tout un clan (`scopeNoteFor`).
    const [lignees, setLignees] = useState(null);
    const [clans, setClans] = useState(null);

    useEffect(() => {
        let cancelled = false;

        [["lignees", setLignees], ["clans", setClans]].forEach(([key, setter]) => {
            const config = wiki.manifest.collections.find(entry => entry.key === key);
            if (!config) return;

            getCollection(config.file).then(collection => {
                if (!cancelled) setter(collection);
            });
        });

        return () => {
            cancelled = true;
        };
    }, [wiki.manifest]);

    const ligneeClanMap = useMemo(() => {
        const map = new Map();
        (lignees?.items || []).forEach(item => {
            const clan = relationRef(item, "Clan")?.title;
            if (clan) map.set(item.slug, clan);
        });
        return map;
    }, [lignees]);

    // Union Atouts + Handicaps : cette vue mélange les deux collections sous
    // le même groupement "Type", et `scopeNoteFor` n'a besoin que de savoir
    // si le slug figure dans la liste du clan, peu importe laquelle.
    const clanAtoutsMap = useMemo(() => {
        const map = new Map();
        (clans?.items || []).forEach(item => {
            const slugsOf = (key) => {
                const property = item.properties?.[key];
                return property?.type === "relation" ? property.value.map(ref => ref.slug) : [];
            };
            map.set(item.title, new Set([
                ...slugsOf("Atouts de clan"),
                ...slugsOf("Handicaps de Clan"),
            ]));
        });
        return map;
    }, [clans]);

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
            itemFilter={(item, typeValue) => isVisibleForGroup(item, typeValue, ligneeClanMap)}
            itemSort={byClanThenCoutThenAlpha(ligneeClanMap)}
            itemSubGroup={(typeValue) => subGroupFor(typeValue, ligneeClanMap)}
            itemHighlightField={highlightFieldFor}
            itemNote={(item) => scopeNoteFor(item, ligneeClanMap, clanAtoutsMap)}
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
