import { useNavigate } from "react-router-dom";
import { BookOpen, FileText } from "lucide-react";
import stringifyValue from "../../utils/stringifyValue";
import BlockRenderer from "../BlockRenderer";

const LEVELS = [1, 2, 3, 4, 5];

function itemLevel(item) {
    const value = Number(item.properties?.Niveau);
    return LEVELS.includes(value) ? value : null;
}

export default function RitualsView({ wiki, collectionKey, niveau }) {

    const navigate = useNavigate();
    const { loadedCollections } = wiki.collections;
    const { activeNavigation } = wiki.navigation;

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
                                        selected?.key === collection.key && selected?.niveau === level
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
                {!selected ? (
                    <div className="placeholder">
                        <BookOpen aria-hidden="true" size={34} />
                        <p>Sélectionne un niveau pour afficher les rituels.</p>
                    </div>
                ) : (
                    <>
                        <header>
                            <span>{loadedCollections[selected.key]?.label || "Chargement"}</span>
                            <h1>Niveau {selected.niveau}</h1>
                        </header>

                        {selectedItems.length === 0 ? (
                            <p className="empty">Aucun rituel à ce niveau pour le moment.</p>
                        ) : (
                            selectedItems.map(item => (
                                <section key={item.id} className="ritualEntry">

                                    <h2>{item.title}</h2>

                                    {Object.keys(item.properties || {}).length > 0 ? (
                                        <dl className="properties">
                                            {Object.entries(item.properties).map(([name, value]) => (
                                                <div key={name}>
                                                    <dt>{name}</dt>
                                                    <dd>{stringifyValue(value)}</dd>
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
                            ))
                        )}
                    </>
                )}
            </article>
        </>
    );

}
