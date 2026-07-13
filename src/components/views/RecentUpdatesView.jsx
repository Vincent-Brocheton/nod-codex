import { Link } from "react-router-dom";
import AppIcon from "../AppIcon";
import { History } from "lucide-react";

function formatDate(iso) {
    if (!iso) return "";
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

/**
 * Liste complète des fiches les plus récemment modifiées (toutes
 * collections confondues), calculée à la synchro et exposée via
 * `manifest.recent` — voir `computeRecentItems` dans sync-notion.js.
 * Accessible depuis "Voir toutes les mises à jour" sur l'accueil, pas
 * exposée dans la sidebar (page secondaire).
 */
export default function RecentUpdatesView({ wiki }) {

    const recent = wiki?.manifest?.recent || [];

    return (
        <section className="pageView indexView">

            <header className="indexHero">
                <span className="indexHeroIcon">
                    <History size={26} aria-hidden="true" />
                </span>

                <div>
                    <span className="eyebrow">Wiki de chronique</span>
                    <h1>Dernières mises à jour</h1>
                </div>
            </header>

            {recent.length === 0 ? (
                <p className="empty">Aucune mise à jour récente.</p>
            ) : (
                <ul className="recentList">
                    {recent.map((item) => (
                        <li key={`${item.collectionKey}/${item.slug}`}>
                            <Link to={`${item.path}/${item.slug}`} className="recentRow">
                                <AppIcon name={item.icon} size={16} aria-hidden="true" />

                                <span className="recentInfo">
                                    <strong>{item.title}</strong>
                                    <span>{item.collectionLabel}</span>
                                </span>

                                <span className="recentDate">{formatDate(item.lastEditedTime)}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

        </section>
    );

}
