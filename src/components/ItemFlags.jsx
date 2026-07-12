import { ShieldAlert, UserX } from "lucide-react";

/**
 * Badges d'état optionnels : "Approbation" (approbation du conteur
 * nécessaire pour jouer) et "Complet" (quota de joueurs déjà atteint, pour
 * un Clan). `needsApproval`/`full` sont déjà résolus par l'appelant, qui
 * peut les tirer soit des propriétés complètes d'une fiche (liste/détail),
 * soit d'une relation résumée par le registre de synchro (ex. les Lignées
 * listées sur une fiche Clan, voir `RelatedGroups`). `compact` réduit
 * l'affichage à de simples icônes avec infobulle (liste), sinon un texte
 * complet accompagne l'icône (fiche de détail).
 */
export default function ItemFlags({ needsApproval, full, compact = false }) {
    if (!needsApproval && !full) return null;

    if (compact) {
        return (
            <span className="itemFlags">
                {needsApproval ? (
                    <ShieldAlert size={14} className="flagApproval" aria-label="Approbation nécessaire" />
                ) : null}
                {full ? (
                    <UserX size={14} className="flagFull" aria-label="Clan complet" />
                ) : null}
            </span>
        );
    }

    return (
        <div className="itemFlags itemFlagsDetail">
            {needsApproval ? (
                <span className="itemFlag itemFlagApproval">
                    <ShieldAlert size={14} aria-hidden="true" />
                    Approbation nécessaire
                </span>
            ) : null}

            {full ? (
                <span className="itemFlag itemFlagFull">
                    <UserX size={14} aria-hidden="true" />
                    Clan complet
                </span>
            ) : null}
        </div>
    );
}
