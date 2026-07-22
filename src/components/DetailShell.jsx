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
 *
 * `emblem`, optionnel, est aussi appelé avec la fiche active et affiché à
 * côté du titre (ex. l'emblème de clan) : seules les vues qui le passent
 * changent de mise en page, les autres gardent l'en-tête d'origine à
 * l'identique. `subtitle`, même principe, affiche une ligne libellée
 * (`subtitleLabel`) sous le titre (ex. les surnoms d'un clan) quand la
 * fonction renvoie une valeur non vide.
 */
export default function DetailShell({
    wiki,
    backPath,
    backLabel = "Retour à la liste",
    emblem,
    subtitle,
    subtitleLabel = "Surnoms",
    children,
}) {

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

    const subtitleText = subtitle ? subtitle(activeItem) : null;

    const titleBlock = (
        <>
            <span>{activeItem.collectionLabel}</span>
            <h1>{activeItem.title}</h1>
            {subtitleText ? (
                <p className="detailHeaderSubtitle">
                    <span>{subtitleLabel}</span> {subtitleText}
                </p>
            ) : null}
        </>
    );

    return (
        <article className="detailPane">

            <Link to={backPath} className="backLink">
                <ArrowLeft aria-hidden="true" size={16} />
                {backLabel}
            </Link>

            <header>
                {emblem ? (
                    <div className="detailHeaderRow">
                        <div className="detailHeaderEmblem">{emblem(activeItem)}</div>
                        <div className="detailHeaderText">{titleBlock}</div>
                    </div>
                ) : (
                    titleBlock
                )}
            </header>

            <div className="detailCard">
                {children(activeItem)}
            </div>

        </article>
    );

}
