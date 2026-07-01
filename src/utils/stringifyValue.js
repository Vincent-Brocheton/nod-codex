export default function stringifyValue(value) {
    if (Array.isArray(value)) return value.join(", ");
    if (value === true) return "Oui";
    if (value === false) return "Non";
    if (value === null || value === undefined) return "";
    return String(value);
}