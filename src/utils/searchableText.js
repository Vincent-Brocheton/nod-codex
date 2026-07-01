import stringifyValue from "./stringifyValue";

export default function searchableText(collection, item) {
    return [
        collection.label,
        collection.group,
        item.title,
        ...Object.values(item.properties || {}).map(stringifyValue),
        ...(item.content || []).map((block) => block.text || "")
    ]
        .join(" ")
        .toLowerCase();
}