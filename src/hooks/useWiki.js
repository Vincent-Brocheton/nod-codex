import useManifest from "./useManifest";
import useCollections from "./useCollections";
import useGlobalSearch from "./useGlobalSearch";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useNavigation from "./useNavigation";

export default function useWiki({
    section,
    slug,
} = {}) {
    const [query, setQuery] = useState("");

    const { manifest, loading, error } = useManifest();

    const navigation = useNavigation(section);

    const collections = useCollections(
        manifest,
        navigation.activeNavigation,
        { section, slug }
    );

    const globalSearch = useGlobalSearch(manifest, query);

    const navigate = useNavigate();

    function open(item) {

        if (item.type === "collection") {
            collections.actions.selectCollections(item.collections);
        }

        navigate(item.path);

    }

    return {
        manifest,
        loading,
        error,
        collections,
        open,
        navigation,
        globalSearch,
        search: {
            query,
            setQuery,
        }
    };
}