import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { normalizeProperty, isPropertyEmpty } from "../../utils/property";
import PropertyValue from "../PropertyValue";
import BlockRenderer from "../BlockRenderer";
import LoadingState from "../States/LoadingState";

/**
 * Vue générique "catégories x valeur groupée" (ex. Rituels par niveau,
 * Atouts & Handicaps par coût). `groups` est la liste fixe des valeurs
 * possibles à afficher pour chaque catégorie.
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
}) {

    const navigate = useNavigate();
    const { loadedCollections, computed } = wiki.collections;
    const { activeNavigation } = wiki.navigation;
    const { loading } = computed;

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
        : [];

    function selectGroup(key, value) {
        navigate(`${activeNavigation.path}/${key}/${value}`);
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
                                <button
                                    key={value}
                                    className={
                                        selected.key === collection.key && selected.value === value
                                            ? "selected"
                                            : ""
                                    }
                                    onClick={() => selectGroup(collection.key, value)}
                                >
                                    <FileText aria-hidden="true" size={17} />
                                    <span>{formatGroupLabel(value)}</span>
                                </button>
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
                            selectedItems.map(item => {
                                const properties = Object.entries(item.properties || {})
                                    .map(([name, raw]) => [name, normalizeProperty(raw)])
                                    .filter(([, property]) => !isPropertyEmpty(property));

                                return (
                                    <section key={item.id} className="ritualEntry">

                                        <h2>{item.title}</h2>

                                        {properties.length > 0 ? (
                                            <dl className="properties">
                                                {properties.map(([name, property]) => (
                                                    <div key={name}>
                                                        <dt>{name}</dt>
                                                        <dd><PropertyValue property={property} /></dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        ) : null}

                                        <div className="contentBlocks">
                                            {(item.content || []).map((block, index) => (
                                                <BlockRenderer key={`${block.type}-${index}`} block={block} />
                                            ))}
                                        </div>

                                    </section>
                                );
                            })
                        )}
                    </>
                )}
            </article>
        </>
    );

}
