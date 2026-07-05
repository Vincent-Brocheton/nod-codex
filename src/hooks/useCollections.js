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
        const collections = activeCollectionKeys
            .map(key => loadedCollections[key])
            .filter(Boolean);

        if (!collections.length) return;

        if (route.slug) {
            const item = collections
                .map(collection => findPageBySlug(collection, route.slug))
                .find(Boolean);

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveItemId(item?.id || "");
            return;
        }

        // Pas de slug dans l'URL : on affiche juste la liste, sans
        // présélectionner de fiche.
        setActiveItemId("");
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
        .filter(Boolean);

    // Le manifeste n'est pas encore arrivé (collections pas encore résolues),
    // ou il l'est mais les collections actives n'ont pas encore été chargées.
    const loading = !manifest.collections.length ||
        (activeCollectionKeys.length > 0 && activeCollectionKeys.some(key => !loadedCollections[key]));

    const activeCollection = activeCollections[0] ?? null;

    const activeItem = activeCollections
        .flatMap(collection =>
            collection.items.map(item => ({
                ...item,
                collectionKey: collection.key,
                collectionLabel: collection.label,
            }))
        )
        .find(item => item.id === activeItemId) ?? null;

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

    const pageNotFound =
        Boolean(route.slug) && !activeItem && !loading;
    const actions = {
        selectCollections,
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
        loading,
    };

    return {
        loadedCollections,
        state,
        computed,
        actions,
    };
}