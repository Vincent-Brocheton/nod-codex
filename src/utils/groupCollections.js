export default function groupCollections(collections) {
    return collections.reduce((groups, collection) => {
        const group = groups.get(collection.group) || [];
        group.push(collection);
        groups.set(collection.group, group);
        return groups;
    }, new Map());
}