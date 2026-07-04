import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { normalizeProperty } from "../../utils/property";
import ItemListButton from "../ItemListButton";
import ItemDetailBody from "../ItemDetailBody";
import StatBlock from "../StatBlock";
import RelatedGroups from "../RelatedGroups";
import LoadingState from "../States/LoadingState";

/**
 * Vue générique "catégories x valeur groupée" (ex. Rituels par niveau,
 * Atouts & Handicaps par coût). `groups` est la liste fixe des valeurs
 * possibles à afficher pour chaque catégorie.
 *
 * `itemStatFields`/`itemRelatedGroups` sont optionnels : quand fournis, ils
 * remplacent le tableau générique de propriétés pour chaque fiche affichée
 * dans un groupe (mêmes composants que sur les fiches Discipline/Pouvoir/Clan).
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
    hideGroupedProperties = false,
    singleItemStatFields,
    singleItemRelatedGroups,
    itemFilter = () => true,
    resolveBackPath,
}) {

    const navigate = useNavigate();
    const { loadedCollections, computed } = wiki.collections;
    const { activeNavigation } = wiki.navigation;
    const { loading, activeItem } = computed;

    const collections = activeNavigation.collections
        .map(key => loadedCollections[key])
        .filter(Boolean);

    function itemGroupValue(item) {
        const property = normalizeProperty(item.properties?.[propertyName]);
        return groups.find(value => Number(value) === Number(property.value)) ?? null;
    }

    const selectedValue = groups.find(value => Number(value) === Number(groupValue));
    const selected = collectionKey && selectedValue !== undefined
        ? { key: collectionKey, value: selectedValue }
        : null;

    const selectedItems = selected
        ? (loadedCollections[selected.key]?.items || [])
            .filter(item => itemGroupValue(item) === selected.value)
            .filter(itemFilter)
        : [];

    function selectGroup(key, value) {
        navigate(`${activeNavigation.path}/${key}/${value}`);
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
                                            <span className="powerLevel">{value}</span>
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
                        ) : (
                            selectedItems.map(item => (
                                <section key={item.id} className="ritualEntry">
                                    <h2>{item.title}</h2>
                                    {itemStatFields ? <StatBlock item={item} fields={itemStatFields} /> : null}
                                    {itemRelatedGroups ? <RelatedGroups item={item} groups={itemRelatedGroups} /> : null}
                                    <ItemDetailBody
                                        item={item}
                                        hideProperties={hideGroupedProperties || Boolean(itemStatFields || itemRelatedGroups)}
                                    />
                                </section>
                            ))
                        )}
                    </>
                )}
            </article>
        </>
    );

}
