import AppIcon from "./AppIcon";

/**
 * En-tête commun aux pages d'index illustrées (Clans, Disciplines,
 * Techniques...) : icône de section, fil d'Ariane, titre, petit séparateur.
 * Centralisé pour que ces pages restent visuellement alignées entre elles
 * plutôt que de dupliquer ce balisage dans chacune.
 */
export default function IndexPageHeader({ icon, eyebrow = "Règles", label }) {
    return (
        <header className="indexHero">
            <span className="indexHeroIcon">
                <AppIcon name={icon} size={26} />
            </span>

            <div>
                <span className="eyebrow">{eyebrow}</span>
                <h1>{label}</h1>
                <div className="pageTitleDivider" aria-hidden="true"><span>✦</span></div>
            </div>
        </header>
    );
}
