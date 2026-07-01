import useManifest from "./useManifest";
import useCollections from "./useCollections";
import { useState } from "react";

export default function useWiki({
    section,
    slug,
} = {}) {
        const [query, setQuery] = useState("");

    const { manifest, loading } = useManifest();

    const collections = useCollections(manifest,{section,slug},query);

    return {
        manifest,
        loading,
        collections,
        search: {
            query,
            setQuery,
        }
    };
}