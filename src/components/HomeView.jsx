import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { navigation } from "../config/navigation";
import AppIcon from "./AppIcon";

// Accroche + code de classement des cartes "Accès rapide" ; les cartes
// elles-mêmes (une par entrée visible de l'encart "Règles" de la sidebar,
// voir plus bas) restent synchronisées avec la navigation sans duplication.
const QUICK_LINK_META = {
    clans: { code: "CLA", description: "Découvrez les clans et leurs héritages." },
    disciplines: { code: "DIS", description: "Explorez les pouvoirs vampiriques." },
    techniques: { code: "TEC", description: "Perfectionnez vos techniques de combat." },
    rituals: { code: "RIT", description: "Maîtrisez les arts occultes." },
    skills: { code: "CMP", description: "Liste des compétences et utilisations." },
    "merits-flaws": { code: "A&H", description: "Choisissez vos atouts et handicaps." },
};

const QUICK_LINKS = (navigation.find((group) => group.id === "rules")?.children || [])
    .filter((item) => !item.hidden)
    .map((item) => ({
        icon: item.icon,
        label: item.label,
        path: item.path,
        code: QUICK_LINK_META[item.id]?.code || "—",
        description: QUICK_LINK_META[item.id]?.description || "",
    }));

function formatDate(iso) {
    if (!iso) return "";
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export default function HomeView({ wiki }) {

    const recent = (wiki?.manifest?.recent || []).slice(0, 4);

    return (
        <main>
            <section className="pageView homeView">

                <div className="homeHero">
                    <span className="eyebrow">Wiki de chronique</span>

                    <h1>Vampire : la Mascarade</h1>

                    <div className="homeHeroDivider" aria-hidden="true"><span>✦</span></div>

                    <blockquote>
                        « La Mascarade nous protège. Ici commence votre histoire parmi les enfants de Caïn. »
                    </blockquote>

                    <p>
                        Clans, disciplines, règles : tout ce qu'il faut pour incarner votre
                        personnage dans la chronique.
                    </p>
                </div>

                <section className="homeSection">
                    <h2>Accès rapide</h2>

                    <div className="quickLinkGrid">
                        {QUICK_LINKS.map((link) => (
                            <Link key={link.path} to={link.path} className="quickLinkCard">
                                <span className="quickLinkTab">{link.code}</span>

                                <span className="quickLinkHead">
                                    <AppIcon name={link.icon} size={17} aria-hidden="true" />
                                    <strong>{link.label}</strong>
                                </span>

                                <p>{link.description}</p>

                                <ChevronRight className="quickLinkArrow" size={15} aria-hidden="true" />
                            </Link>
                        ))}
                    </div>
                </section>

                <div className="homeColumns">

                    <section className="homeSection">
                        <h2>Dernières mises à jour</h2>

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

                        <Link to="/mises-a-jour" className="homeMoreLink">
                            Voir toutes les mises à jour
                            <ChevronRight size={16} aria-hidden="true" />
                        </Link>
                    </section>

                    <section className="homeSection homeStart">
                        <h2>Bien débuter</h2>

                        <Link to="/creation" className="startCard startCardCreate">
                            <span className="startCardIcon">
                                <AppIcon name="user" size={22} />
                            </span>

                            <span>
                                <strong>Nouveau dans la chronique ?</strong>
                                <p>Tout ce qu'il faut savoir pour créer votre personnage et commencer votre histoire.</p>
                                <span className="startCardLink">
                                    Créer son personnage
                                    <ChevronRight size={14} aria-hidden="true" />
                                </span>
                            </span>
                        </Link>

                        <div className="startCard">
                            <span className="startCardIcon">
                                <AppIcon name="help-circle" size={22} />
                            </span>

                            <span>
                                <strong>Besoin d'aide ?</strong>
                                <p>Consultez la FAQ ou les règles générales pour répondre à vos questions.</p>

                                <span className="startCardLinks">
                                    <Link to="/faq">
                                        Voir la FAQ
                                        <ChevronRight size={14} aria-hidden="true" />
                                    </Link>
                                    <Link to="/regles">
                                        Règles générales
                                        <ChevronRight size={14} aria-hidden="true" />
                                    </Link>
                                </span>
                            </span>
                        </div>
                    </section>

                </div>

            </section>
        </main>
    );

}
