import { navigation } from "../config/navigation";
import { buildCollectionNavIndex } from "../../shared/collectionNavIndex.js";

const index = buildCollectionNavIndex(navigation);

export default function collectionNavPath(collectionKey) {
    return index.get(collectionKey)?.path || null;
}
