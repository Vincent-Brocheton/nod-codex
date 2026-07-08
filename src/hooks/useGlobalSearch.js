import { useEffect, useState } from "react";
import { getCollection } from "../services/wikiServices";
import searchableText from "../utils/searchableText";
import collectionNavPath from "../utils/collectionNavPath";

/**
 * Recherche à travers toutes les collections du site (pas seulement celle
 * actuellement affichée). Les collections sont chargées à la demande, dès
 * qu'une recherche est active, puis conservées en mémoire pour les
 * recherches suivantes.
 */
export default function useGlobalSearch(manifest, query) {
    const [loadedCollections, setLoadedCollections] = useState({});

    const normalizedQuery = query.trim().toLowerCase();
    const active = normalizedQuery.length > 0;

    useEffect(() => {
        if (!active || !manifest.collections.length) return;

        async function load() {
            const missing = manifest.collections.filter(
                (config) => !loadedCollections[config.key]
            );

            if (!missing.length) return;

            const loaded = await Promise.all(
                missing.map(async (config) => ({
                    key: config.key,
                    collection: await getCollection(config.file),
                }))
            );

            setLoadedCollections((current) => {
                const next = { ...current };
                loaded.forEach(({ key, collection }) => { next[key] = collection; });
                return next;
            });
        }

        load().then();

    }, [active, manifest, loadedCollections]);

    const allLoaded = manifest.collections.length > 0 &&
        manifest.collections.every((config) => loadedCollections[config.key]);

    // Seules les collections rattachées à une section de navigation peuvent
    // être liées ; les autres sont ignorées (résultat sans destination).
    const results = !active ? [] : Object.values(loadedCollections)
        .filter((collection) => collectionNavPath(collection.key))
        .flatMap((collection) =>
            collection.items
                .filter((item) => searchableText(collection, item).includes(normalizedQuery))
                .map((item) => ({
                    ...item,
                    collectionKey: collection.key,
                    collectionLabel: collection.label,
                }))
        );

    return {
        active,
        loading: active && !allLoaded,
        results,
    };
}
