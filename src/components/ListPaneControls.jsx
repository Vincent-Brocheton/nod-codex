import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

/**
 * Bouton de repli affiché dans l'en-tête de la colonne liste (voir
 * ListPaneHeader, DisciplinePowersView, GroupedRuleView). Partagé plutôt
 * que dupliqué : les trois en-têtes ont un contenu différent mais le même
 * contrôle de repli.
 */
export function ListPaneCollapseButton({ onToggle }) {
    return (
        <button
            type="button"
            className="listPaneCollapse"
            onClick={onToggle}
            aria-label="Masquer la liste"
            title="Masquer la liste"
        >
            <PanelLeftClose size={16} aria-hidden="true" />
        </button>
    );
}

/**
 * Bouton de réaffichage en haut d'une fiche quand la colonne liste est
 * repliée (voir DetailShell, GroupedRuleView).
 */
export function ListPaneRevealButton({ onToggle }) {
    return (
        <button type="button" className="listPaneReveal" onClick={onToggle}>
            <PanelLeftOpen size={15} aria-hidden="true" />
            Afficher la liste
        </button>
    );
}
