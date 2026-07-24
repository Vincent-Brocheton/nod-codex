import { PanelLeftClose } from "lucide-react";

/**
 * En-tête commun à la colonne de liste (groupe, titre, nombre de fiches),
 * partagé par ListView, CategorizedListView, LigneesListView et IconListPane.
 * `onToggleListPane`, optionnel, affiche un bouton pour replier la colonne
 * (voir useListPaneCollapsed) ; les vues qui n'en ont pas l'usage l'omettent
 * simplement plutôt que de recevoir un handler vide.
 */
export default function ListPaneHeader({ group, label, loading, count, onToggleListPane }) {
    return (
        <header className="listPaneHeader">
            <span>{group || "Chargement"}</span>
            <h1>{label || "Base"}</h1>
            <p>{loading ? "…" : `${count} fiche(s)`}</p>

            {onToggleListPane ? (
                <button
                    type="button"
                    className="listPaneCollapse"
                    onClick={onToggleListPane}
                    aria-label="Masquer la liste"
                    title="Masquer la liste"
                >
                    <PanelLeftClose size={16} aria-hidden="true" />
                </button>
            ) : null}
        </header>
    );
}
