import { navigation } from "../config/navigation";

const pathByCollectionKey = new Map();

for (const group of navigation) {
    for (const item of group.children) {
        if (item.type !== "collection") continue;

        for (const key of item.collections) {
            pathByCollectionKey.set(key, item.path);
        }
    }
}

export default function collectionNavPath(collectionKey) {
    return pathByCollectionKey.get(collectionKey) || null;
}
