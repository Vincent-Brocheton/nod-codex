export default function slugify(text) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function buildPageUrl(section, slug) {
    return `/${section}/${slug}`;
}

export function buildSectionUrl(section) {
    return `/${section}`;
}