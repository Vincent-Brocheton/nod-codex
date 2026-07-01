import { useEffect, useState } from "react";
import { getManifest } from "../services/wikiServices";

export default function useManifest() {
    const [manifest, setManifest] = useState({
        generatedAt: "",
        collections: [],
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getManifest();
                setManifest(data);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return {
        manifest,
        loading,
    };
}