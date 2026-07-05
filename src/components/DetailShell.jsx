import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LoadingState from "./States/LoadingState";
import PageNotFoundState from "./States/PageNotFoundState";
import EmptyState from "./States/EmptyState";

/**
 * Coquille commune à toutes les vues de détail : gère les états de
 * chargement/404/vide, puis affiche le lien retour et l'en-tête (libellé de
 * collection + titre). Le contenu propre à chaque fiche est fourni via
 * `children`, appelé avec la fiche active une fois celle-ci résolue.
 */
export default function DetailShell({ wiki, backPath, backLabel = "Retour à la liste", children }) {

    const { activeItem, pageNotFound, loading } = wiki.collections.computed;

    if (wiki.loading || loading) {
        return <LoadingState />;
    }

    if (pageNotFound) {
        return <PageNotFoundState />;
    }

    if (!activeItem) {
        return <EmptyState />;
    }

    return (
        <article className="detailPane">

            <Link to={backPath} className="backLink">
                <ArrowLeft aria-hidden="true" size={16} />
                {backLabel}
            </Link>

            <header>
                <span>{activeItem.collectionLabel}</span>
                <h1>{activeItem.title}</h1>
            </header>

            {children(activeItem)}

        </article>
    );

}
