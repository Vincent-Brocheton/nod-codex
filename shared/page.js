export function findPageBySlug(collection, slug) {
    return collection.items.find(
        (item) => item.slug === slug
    );
}