import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { normalizeProperty, isPropertyEmpty } from "../../utils/property";
import PropertyValue from "../PropertyValue";
import BlockRenderer from "../BlockRenderer";
import LoadingState from "../States/LoadingState";

const LEVELS = [1, 2, 3, 4, 5];

function itemLevel(item) {
    const property = normalizeProperty(item.properties?.Niveau);
    const value = Number(property.value);
    return LEVELS.includes(value) ? value : null;
}

export default function RitualsView({ wiki, collectionKey, niveau }) {

    const navigate = useNavigate();
    const { loadedCollections, computed } = wiki.collections;
    const { activeNavigation } = wiki.navigation;
    const { loading } = computed;

    const collections = activeNavigation.collections
        .map(key => loadedCollections[key])
        .filter(Boolean);

    const selectedNiveau = Number(niveau);
    const selected = collectionKey && LEVELS.includes(selectedNiveau)
        ? { key: collectionKey, niveau: selectedNiveau }
        : null;

    const selectedItems = selected
        ? (loadedCollections[selected.key]?.items || [])
            .filter(item => itemLevel(item) === selected.niveau)
        : [];

    function selectLevel(key, level) {
        navigate(`${activeNavigation.path}/${key}/${level}`);
    }

    if (!selected) {
        return (
            <div className="pageArea">
                <section className="pageView indexView">

                    <span className="eyebrow">Règles</span>
                    <h1>{activeNavigation.label}</h1>

                    {!loading ? (
                        <p className="indexIntro">
                            Voici les rituels de la chronique, classés par catégorie et par niveau (1 à 5).
                        </p>
                    ) : null}

                    {loading ? (
                        <LoadingState message="Chargement des rituels..." />
                    ) : (
                        collections.map(collection => (
                            <div key={collection.key} className="indexGroup">

                                <h2>{collection.label}</h2>

                                <div className="indexGrid">
                                    {LEVELS.map(level => (
                                        <button
                                            key={level}
                                            className="indexCard"
                                            onClick={() => selectLevel(collection.key, level)}
                                        >
                                            <span className="powerLevel">{level}</span>
                                            <span>Niveau {level}</span>
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

                            {LEVELS.map(level => (
                                <button
                                    key={level}
                                    className={
                                        selected.key === collection.key && selected.niveau === level
                                            ? "selected"
                                            : ""
                                    }
                                    onClick={() => selectLevel(collection.key, level)}
                                >
                                    <FileText aria-hidden="true" size={17} />
                                    <span>Niveau {level}</span>
                                </button>
                            ))}

                        </div>
                    ))}
                </div>

            </section>

            <article className="detailPane">
                {loading ? (
                    <LoadingState />
                ) : (
                    <>
                        <header>
                            <span>{loadedCollections[selected.key]?.label || "Chargement"}</span>
                            <h1>Niveau {selected.niveau}</h1>
                        </header>

                        {selectedItems.length === 0 ? (
                            <p className="empty">Aucun rituel à ce niveau pour le moment.</p>
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
