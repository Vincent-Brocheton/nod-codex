import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronDown, ShieldAlert } from "lucide-react";
import { normalizeProperty, isPropertyEmpty, propertyText } from "../../utils/property";
import ItemListButton from "../ItemListButton";
import ItemDetailBody from "../ItemDetailBody";
import ItemFlags from "../ItemFlags";
import StatBlock from "../StatBlock";
import RelatedGroups from "../RelatedGroups";
import IndexPageHeader from "../IndexPageHeader";
import AppIcon from "../AppIcon";
import { ListPaneCollapseButton, ListPaneRevealButton } from "../ListPaneControls";
import LoadingState from "../States/LoadingState";

// Regroupe les éléments consécutifs partageant la même clé (le tableau doit
// déjà être trié selon cette clé, ex. via `itemSort`).
function groupConsecutive(items, keyFn) {
    const groups = [];

    for (const item of items) {
        const key = keyFn(item);
        const last = groups[groups.length - 1];

        if (last && last.key === key) {
            last.items.push(item);
        } else {
            groups.push({ key, items: [item] });
        }
    }

    return groups;
}

// Une fiche affichée dans un groupe (ex. un Rituel, un Atout). Factorisé
// car affiché à deux endroits identiques (avec et sans sous-groupe).
// `itemHighlightField` ({ label, key }) met en avant une propriété qui
// mérite d'être vue avant tout le reste (ex. une Restriction d'usage),
// dans un encart distinct plutôt que noyée dans le bloc de propriétés.
//
// `collapsible` (Rituels : un niveau peut compter jusqu'à 18 fiches) replie
// chaque fiche par défaut derrière un bouton titre + accroche, plutôt que
// tout dérouler d'un coup. L'état ouvert/fermé est local à chaque fiche
// (pas remonté au parent) : plusieurs peuvent rester ouvertes en même temps
// (contrairement à la FAQ qui n'en garde qu'une), et basculer l'une d'elles
// ne re-rend qu'elle-même, pas tout le groupe. Atouts & Handicaps ne passe
// pas cette prop et garde le comportement d'origine, toujours déployé.
function ItemEntry({
    item,
    headingTag: Heading,
    itemStatFields,
    itemRelatedGroups,
    itemHighlightField,
    hideGroupedProperties,
    manifest,
    collapsible = false,
}) {
    const [open, setOpen] = useState(false);

    const highlight = itemHighlightField
        ? normalizeProperty(item.properties?.[itemHighlightField.key])
        : null;
    const highlightText = highlight && !isPropertyEmpty(highlight)
        ? `${itemHighlightField.label} : ${propertyText(highlight)}`
        : null;

    const body = (
        <>
            {itemStatFields ? <StatBlock item={item} fields={itemStatFields} /> : null}
            {itemRelatedGroups ? <RelatedGroups item={item} groups={itemRelatedGroups} /> : null}
            <ItemDetailBody
                item={item}
                hideProperties={hideGroupedProperties || Boolean(itemStatFields || itemRelatedGroups)}
                manifest={manifest}
            />
        </>
    );

    if (!collapsible) {
        return (
            <section className="ritualEntry">
                <Heading>{item.title}</Heading>

                <ItemFlags
                    needsApproval={item.properties?.Approbation?.value === true}
                    full={item.properties?.Complet?.value === true}
                />

                {highlightText ? (
                    <p className="itemHighlight">
                        <ShieldAlert size={14} aria-hidden="true" />
                        {highlightText}
                    </p>
                ) : null}

                {body}
            </section>
        );
    }

    return (
        <section className="ritualEntry">
            <button type="button" className="ritualEntryToggle" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
                <Heading>{item.title}</Heading>
                {highlightText ? <span className="ritualEntryHighlight">{highlightText}</span> : null}
                <ItemFlags
                    needsApproval={item.properties?.Approbation?.value === true}
                    full={item.properties?.Complet?.value === true}
                    compact
                />
                <ChevronDown className="ritualEntryChevron" size={18} aria-hidden="true" />
            </button>

            {open ? <div className="ritualEntryBody">{body}</div> : null}
        </section>
    );
}

/**
 * Vue générique "catégories x valeur groupée" (ex. Rituels par niveau,
 * Atouts & Handicaps par type). `groups` est la liste fixe des valeurs
 * possibles à afficher pour chaque catégorie ; les valeurs peuvent être
 * numériques (niveau) ou textuelles (type), la comparaison se fait en texte.
 * `itemSort` trie les fiches d'un groupe (ex. par coût puis alphabétique).
 * `itemSubGroup` ({ key, label }) affiche un sous-titre entre les fiches
 * quand la clé change (le tableau doit déjà être trié par cette clé via
 * `itemSort`) ; ex. "Atouts à 1 point" puis "Atouts à 2 points".
 * `showGroupBadge` masque le badge rond (peu lisible pour un texte long
 * comme un nom de type) sur les cartes de l'index.
 *
 * `itemFilter(item, groupValue)` peut varier selon le groupe sélectionné
 * (ex. Atouts & Handicaps : la catégorie "Clan" ne montre que les fiches
 * liées à un clan, les autres catégories excluent celles liées à un
 * clan/une lignée). `itemSubGroup` et `itemHighlightField` acceptent aussi
 * une fonction de la valeur du groupe sélectionné plutôt qu'une valeur
 * fixe, pour la même raison (ex. sous-groupé par clan + Coût affiché en
 * évidence sur "Clan", par coût ailleurs). Un sous-groupe avec
 * `filterable: true` (ex. le sous-groupe par clan ou par coût) affiche en
 * plus une rangée de puces au-dessus de la liste, pour sauter directement à
 * une seule valeur plutôt que de faire défiler tous les sous-groupes ;
 * `filterLabel(value)` personnalise le texte de la puce (par défaut la
 * valeur brute, ex. le nom d'un clan — utile pour un libellé du genre
 * "2 points" sur une valeur numérique de coût).
 *
 * `itemStatFields`/`itemRelatedGroups` sont optionnels : quand fournis, ils
 * remplacent le tableau générique de propriétés pour chaque fiche affichée
 * dans un groupe (mêmes composants que sur les fiches Discipline/Pouvoir/Clan).
 * `itemHighlightField` met une propriété en évidence dans un encart distinct
 * (ex. Restriction d'un rituel), plutôt que noyée dans `itemStatFields`.
 * `singleItemStatFields`/`singleItemRelatedGroups` jouent le même rôle mais
 * pour une fiche ouverte seule (voir plus bas) : utile quand une info comme
 * le coût est déjà répétée dans le titre du groupe et n'a donc pas besoin
 * d'être réaffichée sur chaque fiche du groupe, mais reste pertinente une
 * fois la fiche isolée.
 *
 * Une fiche peut aussi être ouverte directement par son slug (ex. un Atout
 * lié depuis la fiche de son Clan) plutôt que par catégorie + valeur : dans
 * ce cas `wiki.collections.computed.activeItem` est déjà résolu (recherche
 * multi-collections déjà gérée par useCollections) et on affiche cette
 * fiche seule, avec un lien retour vers `resolveBackPath` si fourni.
 *
 * `groupHeadingIcon(collectionKey)` et `groupCardMeta` (objet `{ [valeur]:
 * { icon, describe(collectionLabel) } }`) enrichissent les cartes de
 * l'index (icône de section, icône + accroche par carte) pour Atouts &
 * Handicaps. Sans eux, les cartes gardent leur forme simple (juste un
 * badge + le libellé) utilisée par Rituels.
 */
export default function GroupedRuleView({
    wiki,
    collectionKey,
    groupValue,
    propertyName,
    groups,
    formatGroupLabel,
    introText,
    emptyMessage,
    itemStatFields,
    itemRelatedGroups,
    itemHighlightField,
    hideGroupedProperties = false,
    singleItemStatFields,
    singleItemRelatedGroups,
    itemFilter = () => true,
    itemSort,
    itemSubGroup,
    showGroupBadge = true,
    resolveBackPath,
    groupHeadingIcon,
    groupCardMeta,
    collapsible = false,
}) {

    const navigate = useNavigate();
    const { loadedCollections, computed } = wiki.collections;
    const { activeNavigation } = wiki.navigation;
    const { loading, activeItem } = computed;

    const collections = activeNavigation.collections
        .map(key => loadedCollections[key])
        .filter(Boolean);

    // Comparaison en texte plutôt qu'en nombre : les valeurs groupées sont
    // parfois numériques (niveau, coût) et parfois textuelles (type).
    function itemGroupValue(item) {
        const property = normalizeProperty(item.properties?.[propertyName]);
        return groups.find(value => String(value) === String(property.value)) ?? null;
    }

    const selectedValue = groups.find(value => String(value) === String(groupValue));
    const selected = collectionKey && selectedValue !== undefined
        ? { key: collectionKey, value: selectedValue }
        : null;

    const filteredItems = selected
        ? (loadedCollections[selected.key]?.items || [])
            .filter(item => itemGroupValue(item) === selected.value)
            .filter(item => itemFilter(item, selected.value))
        : [];

    const selectedItems = itemSort ? [...filteredItems].sort(itemSort) : filteredItems;

    const subGroup = selected
        ? (typeof itemSubGroup === "function" ? itemSubGroup(selected.value) : itemSubGroup)
        : null;

    const highlightField = selected
        ? (typeof itemHighlightField === "function" ? itemHighlightField(selected.value) : itemHighlightField)
        : itemHighlightField;

    // Portée à "collection:groupe" plutôt qu'un simple booléen : en changeant
    // de groupe (ex. Clan -> Camarilla), une ancienne valeur filtrée (un nom
    // de clan) doit être ignorée plutôt que masquer silencieusement le
    // nouveau groupe entier.
    const filterScope = selected ? `${selected.key}:${selected.value}` : null;
    const [subGroupFilter, setSubGroupFilterState] = useState(null);
    const activeFilterValue = subGroupFilter?.scope === filterScope ? subGroupFilter.value : null;

    function setSubGroupFilter(value) {
        setSubGroupFilterState(filterScope ? { scope: filterScope, value } : null);
    }

    const subGroupFilterOptions = subGroup?.filterable
        ? [...new Set(selectedItems.map(subGroup.key))].sort((a, b) => (
            typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b), "fr")
        ))
        : [];

    const itemsToRender = activeFilterValue !== null
        ? selectedItems.filter(item => subGroup.key(item) === activeFilterValue)
        : selectedItems;

    function selectGroup(key, value) {
        navigate(`${activeNavigation.path}/${key}/${encodeURIComponent(value)}`);
    }

    if (!loading && !selected && activeItem) {
        const backPath = (resolveBackPath && resolveBackPath(activeItem)) || activeNavigation.path;

        return (
            <div className="pageArea">
                <article className="detailPane">

                    <Link to={backPath} className="backLink">
                        <ArrowLeft aria-hidden="true" size={16} />
                        Retour à la liste
                    </Link>

                    <header>
                        <span>{activeItem.collectionLabel}</span>
                        <h1>{activeItem.title}</h1>
                    </header>

                    <ItemFlags
                        needsApproval={activeItem.properties?.Approbation?.value === true}
                        full={activeItem.properties?.Complet?.value === true}
                    />

                    <div className="detailCard">
                        {singleItemStatFields ? <StatBlock item={activeItem} fields={singleItemStatFields} /> : null}
                        {singleItemRelatedGroups ? <RelatedGroups item={activeItem} groups={singleItemRelatedGroups} /> : null}
                        <ItemDetailBody
                            item={activeItem}
                            hideProperties={Boolean(singleItemStatFields || singleItemRelatedGroups)}
                            manifest={wiki.manifest}
                        />
                    </div>

                </article>
            </div>
        );
    }

    if (!selected) {
        return (
            <div className="pageArea">
                <section className="pageView indexView">

                    <IndexPageHeader icon={activeNavigation.icon} label={activeNavigation.label} />

                    {!loading ? (
                        <p className="indexIntro">{introText}</p>
                    ) : null}

                    {loading ? (
                        <LoadingState message="Chargement..." />
                    ) : (
                        collections.map(collection => (
                            <div key={collection.key} className="indexGroup">

                                <h2>
                                    {groupHeadingIcon ? (
                                        <AppIcon name={groupHeadingIcon(collection.key)} size={16} aria-hidden="true" />
                                    ) : null}
                                    {collection.label}
                                </h2>

                                <div className="listRows">
                                    {groups.map(value => {
                                        const meta = groupCardMeta?.[value];

                                        return (
                                            <button
                                                key={value}
                                                className={`listRow${meta ? " listRowRich" : ""}`}
                                                onClick={() => selectGroup(collection.key, value)}
                                            >
                                                {meta ? (
                                                    <>
                                                        <span className="listRowIcon">
                                                            <AppIcon name={meta.icon} size={22} />
                                                        </span>
                                                        <strong>{formatGroupLabel(value)}</strong>
                                                        <p>{meta.describe(collection.label)}</p>
                                                        <ArrowRight className="rowArrow" size={16} aria-hidden="true" />
                                                    </>
                                                ) : (
                                                    <>
                                                        {showGroupBadge ? <span className="powerLevel">{value}</span> : null}
                                                        <span className="listRowLabel">{formatGroupLabel(value)}</span>
                                                    </>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                            </div>
                        ))
                    )}

                </section>
            </div>
        );
    }

    return (
        <>
            <section className="listPane">

                <header className="listPaneHeader">
                    <span>Règles</span>
                    <h1>{activeNavigation.label}</h1>

                    <ListPaneCollapseButton onToggle={wiki.layout.toggleListPane} />
                </header>

                <div className="itemList">
                    {collections.map(collection => (
                        <div key={collection.key} className="itemGroup">

                            <h2>{collection.label}</h2>

                            {groups.map(value => (
                                <ItemListButton
                                    key={value}
                                    label={formatGroupLabel(value)}
                                    selected={selected.key === collection.key && selected.value === value}
                                    onClick={() => selectGroup(collection.key, value)}
                                />
                            ))}

                        </div>
                    ))}
                </div>

            </section>

            <article className="detailPane">
                {wiki.layout.listCollapsed ? <ListPaneRevealButton onToggle={wiki.layout.toggleListPane} /> : null}

                <Link to={activeNavigation.path} className="backLink">
                    <ArrowLeft aria-hidden="true" size={16} />
                    Retour à la liste
                </Link>

                {loading ? (
                    <LoadingState />
                ) : (
                    <>
                        <header>
                            <span>{loadedCollections[selected.key]?.label || "Chargement"}</span>
                            <h1>{formatGroupLabel(selected.value)}</h1>
                        </header>

                        {subGroupFilterOptions.length > 1 ? (
                            <div className="subGroupFilterRow">
                                <button
                                    type="button"
                                    className={`subGroupFilterChip${activeFilterValue === null ? " active" : ""}`}
                                    onClick={() => setSubGroupFilter(null)}
                                >
                                    Tous
                                </button>

                                {subGroupFilterOptions.map(value => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={`subGroupFilterChip${activeFilterValue === value ? " active" : ""}`}
                                        onClick={() => setSubGroupFilter(value)}
                                    >
                                        {subGroup.filterLabel ? subGroup.filterLabel(value) : value}
                                    </button>
                                ))}
                            </div>
                        ) : null}

                        {itemsToRender.length === 0 ? (
                            <p className="empty">{emptyMessage}</p>
                        ) : subGroup ? (
                            groupConsecutive(itemsToRender, subGroup.key).map(consecutiveGroup => (
                                <div key={consecutiveGroup.key} className="detailSubGroup">

                                    <h2 className="detailSubGroupTitle">
                                        {subGroup.label(consecutiveGroup.key, loadedCollections[selected.key]?.label)}
                                    </h2>

                                    {consecutiveGroup.items.map(item => (
                                        <ItemEntry
                                            key={item.id}
                                            item={item}
                                            headingTag="h3"
                                            itemStatFields={itemStatFields}
                                            itemRelatedGroups={itemRelatedGroups}
                                            itemHighlightField={highlightField}
                                            hideGroupedProperties={hideGroupedProperties}
                                            manifest={wiki.manifest}
                                            collapsible={collapsible}
                                        />
                                    ))}

                                </div>
                            ))
                        ) : (
                            itemsToRender.map(item => (
                                <ItemEntry
                                    key={item.id}
                                    item={item}
                                    headingTag="h2"
                                    itemStatFields={itemStatFields}
                                    itemRelatedGroups={itemRelatedGroups}
                                    itemHighlightField={highlightField}
                                    hideGroupedProperties={hideGroupedProperties}
                                    manifest={wiki.manifest}
                                    collapsible={collapsible}
                                />
                            ))
                        )}
                    </>
                )}
            </article>
        </>
    );

}
