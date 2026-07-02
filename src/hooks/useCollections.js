import {useEffect, useState} from "react";
import {getCollection} from "../services/wikiServices";
import {findPageBySlug} from "../../shared/page";
import groupCollections from "../utils/groupCollections";
import searchableText from "../utils/searchableText";

export default function useCollections(manifest, activeNavigation, route, query) {
    const [loadedCollections, setLoadedCollections] = useState({});
    const [activeCollectionKeys, setActiveCollectionKeys] = useState([]);
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

        if (activeNavigation?.collections?.length) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveCollectionKeys(activeNavigation.collections);
            return;
        }

        setActiveCollectionKeys(current =>
            current.length
                ? current
                : [manifest.collections[0].key]
        );
    }, [manifest, activeNavigation]);

    /**
     * Charge la collection si elle n'est pas déjà en mémoire
     */
    useEffect(() => {

        if (!activeCollectionKeys.length) return;

        async function load() {
            const missingKeys = activeCollectionKeys.filter(
                key => !loadedCollections[key]
            );

            if (!missingKeys.length) return;

            const loaded = await Promise.all(
                missingKeys.map(async key => {

                    const config = manifest.collections.find(
                        collection => collection.key === key
                    );

                    if (!config) return null;

                    const collection = await getCollection(config.file);

                    return {
                        key,
                        collection,
                    };

                })
            );

            setLoadedCollections(current => {

                const next = {...current};

                loaded
                    .filter(Boolean)
                    .forEach(({key, collection}) => {

                        next[key] = collection;

                    });

                return next;

            });

        }

        load().then();

    }, [manifest, activeCollectionKeys, loadedCollections]);

    /**
     * Sélectionne la page active
     * lorsque le slug ou la collection changent
     */
    useEffect(() => {
        const collection = loadedCollections[activeCollectionKeys];

        if (!collection) return;

        const item = route.slug
            ? findPageBySlug(collection, route.slug)
            : collection.items[0];

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveItemId(item?.id || "");
    }, [
        activeCollectionKeys,
        loadedCollections,
        route.slug,
    ]);

    /**
     * Computed
     */
    const activeCollections = activeCollectionKeys
        .map(key => loadedCollections[key])
        .filter(Boolean)
        .map((collection, index) => ({
            ...collection,
            key: activeCollectionKeys[index],
        }));

    const activeCollection = activeCollections[0] ?? null;

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

    function selectCollections(collectionKeys) {

        setActiveCollectionKeys(collectionKeys);

        setActiveItemId("");

    }

    function openPage(page) {
        setActiveItemId(page.id);
    }

    const pageNotFound =
        Boolean(route.slug) && !activeItem;
    const actions = {
        selectCollections,
        openPage,
    };
    const state = {
        activeCollectionKeys,
        activeItemId,
    };
    const computed = {
        activeCollections,
        activeItem,
        groupedCollections,
        visibleItems,
        pageNotFound,
    };

    return {
        loadedCollections,
        state,
        computed,
        actions,
    };
}