import { useEffect, useState } from "react";
import { getCollection } from "../services/wikiServices";
import { findPageBySlug } from "../../shared/page";
import groupCollections from "../utils/groupCollections";
import searchableText from "../utils/searchableText";

export default function useCollections(manifest, route, query) {
    const [loadedCollections, setLoadedCollections] = useState({});
    const [activeCollectionKey, setActiveCollectionKey] = useState("");
    const [activeItemId, setActiveItemId] = useState("");

    const groupedCollections = groupCollections(
        manifest.collections
    );

    const normalizedQuery =
        query.trim().toLowerCase();

    /**
     * Sélectionne la collection active
     * - depuis l'URL si elle existe
     * - sinon la première collection du manifest
     */
    useEffect(() => {
        if (!manifest.collections.length) return;

        if (route.section) {
            setActiveCollectionKey(route.section);
            return;
        }

        setActiveCollectionKey(
            current => current || manifest.collections[0].key
        );
    }, [manifest, route.section]);

    /**
     * Charge la collection si elle n'est pas déjà en mémoire
     */
    useEffect(() => {
        if (!activeCollectionKey) return;

        if (loadedCollections[activeCollectionKey]) return;

        const config = manifest.collections.find(
            collection => collection.key === activeCollectionKey
        );

        if (!config) return;

        async function load() {
            const collection = await getCollection(config.file);

            setLoadedCollections(current => ({
                ...current,
                [activeCollectionKey]: collection,
            }));
        }

        load();
    }, [manifest, activeCollectionKey, loadedCollections]);

    /**
     * Sélectionne la page active
     * lorsque le slug ou la collection changent
     */
    useEffect(() => {
        const collection = loadedCollections[activeCollectionKey];

        if (!collection) return;

        const item = route.slug
            ? findPageBySlug(collection, route.slug)
            : collection.items[0];

        setActiveItemId(item?.id || "");
    }, [
        activeCollectionKey,
        loadedCollections,
        route.slug,
    ]);

    /**
     * Computed
     */
    const activeCollectionData = loadedCollections[activeCollectionKey];

    const activeCollection = activeCollectionData
        ? {
            ...activeCollectionData,
            key: activeCollectionKey,
        }
        : null;

    const activeItem =
        activeCollection?.items.find(
            item => item.id === activeItemId
        ) ?? null;

    const visibleItems = (() => {
        if (!activeCollection) return [];

        if (!normalizedQuery) {
            return activeCollection.items;
        }

        return activeCollection.items.filter((item) =>
            searchableText(activeCollection, item).includes(normalizedQuery)
        );
    })();

    function selectCollection(collection) {
        setActiveCollectionKey(collection.key);
        setActiveItemId("");
    }

    function openPage(page) {
        setActiveItemId(page.id);
    }
    const actions = {
        selectCollection,
        openPage,
    };
    const state = {
        activeCollectionKey,
        activeItemId,
    };
    const computed = {
        activeCollection,
        activeItem,
        groupedCollections,
        visibleItems
    };

    return {
        loadedCollections,
        state,
        computed,
        actions,
    };
}