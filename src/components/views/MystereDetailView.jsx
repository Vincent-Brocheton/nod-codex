import DetailShell from "../DetailShell";
import ItemDetailBody from "../ItemDetailBody";

/**
 * Fiche de Mystère : contrairement à `GenericDetailView`, les propriétés
 * techniques (Catégorie, Niveau Max, Clans, Factions...) ne sont pas
 * pertinentes pour un joueur qui consulte cette fiche et restent donc
 * masquées ; seuls le Résumé (repris en sous-titre, comme les Surnoms d'un
 * Clan) et le contenu (les paliers de connaissance) sont affichés.
 */
export default function MystereDetailView({ wiki }) {

    const { activeNavigation } = wiki.navigation;

    return (
        <DetailShell
            wiki={wiki}
            backPath={activeNavigation.path}
            subtitle={(item) => item.properties?.["Résumé"]?.value || null}
            subtitleLabel="Résumé"
        >
            {(activeItem) => <ItemDetailBody item={activeItem} hideProperties manifest={wiki.manifest} />}
        </DetailShell>
    );

}
