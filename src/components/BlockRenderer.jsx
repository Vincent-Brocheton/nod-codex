import { Link } from "react-router-dom";

function renderSpans(block, onItemClick) {
    if (!block.spans) return block.text;

    return block.spans.map((span, index) => {
        if (span.path) return <Link key={index} to={span.path}>{span.text}</Link>;

        if (span.item) {
            return (
                <button key={index} type="button" className="wikiItemLink" onClick={() => onItemClick?.(span.item)}>
                    {span.text}
                </button>
            );
        }

        return span.text;
    });
}

export default function Block({ block, onItemClick }) {
    if (block.type === "heading_1") return <h1>{renderSpans(block, onItemClick)}</h1>;
    if (block.type === "heading_2") return <h2>{renderSpans(block, onItemClick)}</h2>;
    if (block.type === "heading_3") return <h3>{renderSpans(block, onItemClick)}</h3>;
    if (block.type === "quote") return <blockquote>{renderSpans(block, onItemClick)}</blockquote>;
    if (block.type === "bulleted_list_item") return <li>{renderSpans(block, onItemClick)}</li>;
    if (block.type === "numbered_list_item") return <li>{renderSpans(block, onItemClick)}</li>;
    if (block.type === "divider") return <hr />;
    if (block.type === "image") {
        return (
            <figure>
                <img src={block.url} alt={block.caption || ""} />
                {block.caption ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
        );
    }
    if (block.type === "table") {
        const [headerRow, ...bodyRows] = block.rows;
        const rows = block.hasColumnHeader ? bodyRows : block.rows;

        return (
            <table>
                {block.hasColumnHeader ? (
                    <thead>
                        <tr>
                            {headerRow.map((cell, index) => <th key={index}>{cell}</th>)}
                        </tr>
                    </thead>
                ) : null}
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
    return <p>{renderSpans(block, onItemClick)}</p>;
}
