import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { normalizeProperty, isPropertyEmpty, propertyText } from "../../utils/property";
import ItemListButton from "../ItemListButton";
import ItemDetailBody from "../ItemDetailBody";
import StatBlock from "../StatBlock";
import RelatedGroups from "../RelatedGroups";
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
function ItemEntry({ item, headingTag: Heading, itemStatFields, itemRelatedGroups, itemHighlightField, hideGroupedProperties }) {
    const highlight = itemHighlightField
        ? normalizeProperty(item.properties?.[itemHighlightField.key])
        : null;

    return (
        <section className="ritualEntry">
            <Heading>{item.title}</Heading>

            {highlight && !isPropertyEmpty(highlight) ? (
                <p className="itemHighlight">
                    <ShieldAlert size={14} aria-hidden="true" />
                    {itemHighlightField.label} : <strong>{propertyText(highlight)}</strong>
                </p>
            ) : null}

            {itemStatFields ? <StatBlock item={item} fields={itemStatFields} /> : null}
            {itemRelatedGroups ? <RelatedGroups item={item} groups={itemRelatedGroups} /> : null}
            <ItemDetailBody
                item={item}
                hideProperties={hideGroupedProperties || Boolean(itemStatFields || itemRelatedGroups)}
            />
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
            .filter(itemFilter)
        : [];

    const selectedItems = itemSort ? [...filteredItems].sort(itemSort) : filteredItems;

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

                    {singleItemStatFields ? <StatBlock item={activeItem} fields={singleItemStatFields} /> : null}
                    {singleItemRelatedGroups ? <RelatedGroups item={activeItem} groups={singleItemRelatedGroups} /> : null}
                    <ItemDetailBody item={activeItem} hideProperties={Boolean(singleItemStatFields || singleItemRelatedGroups)} />

                </article>
            </div>
        );
    }

    if (!selected) {
        return (
            <div className="pageArea">
                <section className="pageView indexView">

                    <span className="eyebrow">Règles</span>
                    <h1>{activeNavigation.label}</h1>

                    {!loading ? (
                        <p className="indexIntro">{introText}</p>
                    ) : null}

                    {loading ? (
                        <LoadingState message="Chargement..." />
                    ) : (
                        collections.map(collection => (
                            <div key={collection.key} className="indexGroup">

                                <h2>{collection.label}</h2>

                                <div className="indexGrid">
                                    {groups.map(value => (
                                        <button
                                            key={value}
                                            className="indexCard"
                                            onClick={() => selectGroup(collection.key, value)}
                                        >
                                            {showGroupBadge ? <span className="powerLevel">{value}</span> : null}
                                            <span>{formatGroupLabel(value)}</span>
                                        </button>
                                    ))}
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

                <header>
                    <span>Règles</span>
                    <h1>{activeNavigation.label}</h1>
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

                        {selectedItems.length === 0 ? (
                            <p className="empty">{emptyMessage}</p>
                        ) : itemSubGroup ? (
                            groupConsecutive(selectedItems, itemSubGroup.key).map(subGroup => (
                                <div key={subGroup.key} className="detailSubGroup">

                                    <h2 className="detailSubGroupTitle">
                                        {itemSubGroup.label(subGroup.key, loadedCollections[selected.key]?.label)}
                                    </h2>

                                    {subGroup.items.map(item => (
                                        <ItemEntry
                                            key={item.id}
                                            item={item}
                                            headingTag="h3"
                                            itemStatFields={itemStatFields}
                                            itemRelatedGroups={itemRelatedGroups}
                                            itemHighlightField={itemHighlightField}
                                            hideGroupedProperties={hideGroupedProperties}
                                        />
                                    ))}

                                </div>
                            ))
                        ) : (
                            selectedItems.map(item => (
                                <ItemEntry
                                    key={item.id}
                                    item={item}
                                    headingTag="h2"
                                    itemStatFields={itemStatFields}
                                    itemRelatedGroups={itemRelatedGroups}
                                    itemHighlightField={itemHighlightField}
                                    hideGroupedProperties={hideGroupedProperties}
                                />
                            ))
                        )}
                    </>
                )}
            </article>
        </>
    );

}
