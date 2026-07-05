/**
 * En-tête commun à la colonne de liste (groupe, titre, nombre de fiches),
 * partagé par ListView, CategorizedListView et LigneesListView.
 */
export default function ListPaneHeader({ group, label, loading, count }) {
    return (
        <header>
            <span>{group || "Chargement"}</span>
            <h1>{label || "Base"}</h1>
            <p>{loading ? "…" : `${count} fiche(s)`}</p>
        </header>
    );
}
