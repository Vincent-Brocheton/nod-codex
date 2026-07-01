import { BookOpen } from "lucide-react";
import stringifyValue from "../utils/stringifyValue";
import BlockRenderer from "./BlockRenderer";
function DetailPanel({
    wiki
}) {
    const { activeCollection, activeItem } = wiki.collections.computed;
    return (<article className="detailPane">
        {activeItem ? (
            <>
                <header>
                    <span>{activeCollection.label}</span>
                    <h1>{activeItem.title}</h1>
                </header>

                {Object.keys(activeItem.properties || {}).length > 0 ? (
                    <dl className="properties">
                        {Object.entries(activeItem.properties).map(([name, value]) => (
                            <div key={name}>
                                <dt>{name}</dt>
                                <dd>{stringifyValue(value)}</dd>
                            </div>
                        ))}
                    </dl>
                ) : null}

                <div className="contentBlocks">
                    {(activeItem.content || []).map((block, index) => (
                        <BlockRenderer key={`${block.type}-${index}`} block={block} />
                    ))}
                </div>
            </>
        ) : (
            <div className="placeholder">
                <BookOpen aria-hidden="true" size={34} />
                <p>SÃ©lectionne une fiche pour l'afficher ici.</p>
            </div>
        )}
    </article>);
}

export default DetailPanel;