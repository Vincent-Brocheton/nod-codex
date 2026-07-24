import { useEffect, useState } from "react";

const STORAGE_KEY = "wiki-list-collapsed";

function getInitial() {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
}

/**
 * Repli manuel de la colonne liste (entre la sidebar et la fiche), pour
 * rendre sa largeur au contenu à la demande plutôt que de la réduire en
 * continu. Retenu en localStorage comme le thème (voir useTheme), pour ne
 * pas avoir à refaire ce choix à chaque fiche ouverte.
 */
export default function useListPaneCollapsed() {
    const [collapsed, setCollapsed] = useState(getInitial);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    }, [collapsed]);

    function toggle() {
        setCollapsed((current) => !current);
    }

    return { collapsed, toggle };
}
