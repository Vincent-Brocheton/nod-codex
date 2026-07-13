import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import AppIcon from "./AppIcon";

const QUICK_LINKS = [
    { icon: "shield-plus", label: "Clans", description: "Découvrez les clans et leurs héritages.", path: "/clans" },
    { icon: "droplet", label: "Disciplines", description: "Explorez les pouvoirs vampiriques.", path: "/disciplines" },
    { icon: "book-open", label: "Règles", description: "Consultez toutes les règles du GN.", path: "/regles" },
    { icon: "pentagram", label: "Rituels", description: "Maîtrisez les arts occultes.", path: "/rituels" },
    { icon: "target", label: "Compétences", description: "Liste des compétences et utilisations.", path: "/competences" },
];

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

                    <div className="homeHeroText">
                        <span className="eyebrow">Wiki de chronique</span>

                        <h1>Vampire : la Mascarade</h1>

                        <div className="homeHeroDivider" aria-hidden="true"><span>✦</span></div>

                        <blockquote>
                            « La Mascarade nous protège. Ici commence votre histoire parmi les enfants de Caïn. »
                        </blockquote>

                        <p>
                            Bienvenue sur le wiki de la chronique. Retrouvez ici les clans, les disciplines,
                            les règles et tout ce qu'il faut savoir pour incarner votre personnage.
                        </p>
                    </div>

                    <div className="homeHeroImage" aria-hidden="true" />

                </div>

                <section className="homeSection">
                    <h2>Accès rapide</h2>

                    <div className="quickLinkGrid">
                        {QUICK_LINKS.map((link) => (
                            <Link key={link.path} to={link.path} className="quickLinkCard">
                                <span className="quickLinkIcon">
                                    <AppIcon name={link.icon} size={22} />
                                </span>

                                <strong>{link.label}</strong>
                                <p>{link.description}</p>

                                <ChevronRight className="quickLinkArrow" size={16} aria-hidden="true" />
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
