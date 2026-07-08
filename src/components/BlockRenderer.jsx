import { Link } from "react-router-dom";

function renderSpans(block) {
    if (!block.spans) return block.text;

    return block.spans.map((span, index) =>
        span.path ? <Link key={index} to={span.path}>{span.text}</Link> : span.text
    );
}

export default function Block({ block }) {
    if (block.type === "heading_1") return <h1>{renderSpans(block)}</h1>;
    if (block.type === "heading_2") return <h2>{renderSpans(block)}</h2>;
    if (block.type === "heading_3") return <h3>{renderSpans(block)}</h3>;
    if (block.type === "quote") return <blockquote>{renderSpans(block)}</blockquote>;
    if (block.type === "bulleted_list_item") return <li>{renderSpans(block)}</li>;
    if (block.type === "numbered_list_item") return <li>{renderSpans(block)}</li>;
    if (block.type === "divider") return <hr />;
    if (block.type === "image") {
        return (
            <figure>
                <img src={block.url} alt={block.caption || ""} />
                {block.caption ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
        );
    }
    return <p>{renderSpans(block)}</p>;
}
