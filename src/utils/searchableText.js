import { normalizeProperty, propertyText } from "./property";

export default function searchableText(collection, item) {
    return [
        collection.label,
        collection.group,
        item.title,
        ...Object.values(item.properties || {}).map((raw) => propertyText(normalizeProperty(raw))),
        ...(item.content || []).map((block) => block.type === "table" ? block.rows.flat().join(" ") : (block.text || ""))
    ]
        .join(" ")
        .toLowerCase();
}