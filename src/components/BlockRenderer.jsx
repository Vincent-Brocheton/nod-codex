export default function Block({ block }) {
    if (block.type === "heading_1") return <h1>{block.text}</h1>;
    if (block.type === "heading_2") return <h2>{block.text}</h2>;
    if (block.type === "heading_3") return <h3>{block.text}</h3>;
    if (block.type === "quote") return <blockquote>{block.text}</blockquote>;
    if (block.type === "bulleted_list_item") return <li>{block.text}</li>;
    if (block.type === "numbered_list_item") return <li>{block.text}</li>;
    if (block.type === "divider") return <hr />;
    if (block.type === "image") {
        return (
            <figure>
                <img src={block.url} alt={block.caption || ""} />
                {block.caption ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
        );
    }
    return <p>{block.text}</p>;
}
