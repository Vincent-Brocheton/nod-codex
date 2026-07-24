import { ListPaneCollapseButton } from "./ListPaneControls";

/**
 * En-tête commun à la colonne de liste (groupe, titre, nombre de fiches),
 * partagé par ListView, CategorizedListView, LigneesListView et IconListPane.
 * `onToggleListPane`, optionnel, affiche un bouton pour replier la colonne
 * (voir useListPaneCollapsed via wiki.layout) ; les vues qui n'en ont pas
 * l'usage l'omettent simplement plutôt que de recevoir un handler vide.
 */
export default function ListPaneHeader({ group, label, loading, count, onToggleListPane }) {
    return (
        <header className="listPaneHeader">
            <span>{group || "Chargement"}</span>
            <h1>{label || "Base"}</h1>
            <p>{loading ? "…" : `${count} fiche(s)`}</p>

            {onToggleListPane ? <ListPaneCollapseButton onToggle={onToggleListPane} /> : null}
        </header>
    );
}
