import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { navigation } from "../config/navigation";
import { getCollection } from "../services/wikiServices";
import AppIcon from "./AppIcon";

// Accroche de secours des cartes "Accès rapide", utilisée seulement tant
// que la collection correspondante n'a pas (encore) de description
// synchronisée depuis Notion (voir l'effet plus bas, qui va chercher la
// vraie donnée pour chaque carte et la préfère dès qu'elle existe).
const QUICK_LINK_FALLBACK = {
    clans: "Découvrez les clans et leurs héritages.",
    techniques: "Perfectionnez vos techniques de combat.",
    rituals: "Consultez les rituels occultes permettant de manipuler le Sang, les esprits et les forces mystiques.",
    skills: "Liste des compétences et utilisations.",
    "merits-flaws": "Personnalisez votre personnage grâce à des avantages uniques et des faiblesses marquantes.",
    attributs: "Force, Dextérité, Manipulation : les capacités innées de votre personnage.",
    historiques: "Havre, Influence, Renommée : les antécédents qui ont façonné votre personnage avant sa Damnation.",
};

function quickLinkItems() {
    return (navigation.find((group) => group.id === "rules")?.children || [])
        .filter((item) => !item.hidden);
}

function formatDate(iso) {
    if (!iso) return "";
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export default function HomeView({ wiki }) {

    const recent = (wiki?.manifest?.recent || []).slice(0, 4);

    const items = useMemo(() => quickLinkItems(), []);

    // Les collections liées à la nav ne sont chargées que si le joueur a
    // déjà visité leur page (chargement à la demande, voir useCollections) :
    // pas fiable pour les accroches de l'accueil, donc on va chercher la
    // description de chacune directement (même cache que le reste de
    // l'appli), en se basant sur sa collection "primaire" (la première de
    // `item.collections`, ex. Disciplines pour la carte Disciplines).
    const [descriptions, setDescriptions] = useState({});

    useEffect(() => {
        const manifestCollections = wiki?.manifest?.collections;
        if (!manifestCollections) return;

        let cancelled = false;

        Promise.all(items.map(async (item) => {
            const config = manifestCollections.find((entry) => entry.key === item.collections?.[0]);
            if (!config) return [item.id, ""];

            const collection = await getCollection(config.file);
            return [item.id, collection.description || ""];
        })).then((pairs) => {
            if (!cancelled) setDescriptions(Object.fromEntries(pairs));
        });

        return () => {
            cancelled = true;
        };
    }, [wiki?.manifest, items]);

    const quickLinks = useMemo(() => items.map((item) => ({
        icon: item.icon,
        label: item.label,
        path: item.path,
        description: descriptions[item.id] || QUICK_LINK_FALLBACK[item.id] || "",
    })), [items, descriptions]);

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
                        Clans, disciplines, règles : tout pour incarner votre personnage.
                    </p>
                </div>

                <section className="homeSection">
                    <h2>Accès rapide</h2>

                    <div className="quickLinkGrid">
                        {quickLinks.map((link) => (
                            <Link key={link.path} to={link.path} className="listRow listRowRich">
                                <span className="listRowIcon">
                                    <AppIcon name={link.icon} size={22} aria-hidden="true" />
                                </span>

                                <strong>{link.label}</strong>

                                <p>{link.description}</p>

                                <ArrowRight className="rowArrow" size={16} aria-hidden="true" />
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
