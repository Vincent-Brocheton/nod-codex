import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search, ShieldPlus } from "lucide-react";
import IndexPageHeader from "../IndexPageHeader";
import LoadingState from "../States/LoadingState";

/**
 * Emblème d'un clan (illustration dédiée par fiche, voir public/images/clans).
 * Retombe sur une icône générique si le fichier n'existe pas encore, pour
 * ne jamais casser la mise en page en attendant que les images soient
 * fournies.
 */
function ClanEmblem({ slug }) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <span className="clanEmblem clanEmblemFallback" aria-hidden="true">
                <ShieldPlus size={26} />
            </span>
        );
    }

    return (
        <img
            className="clanEmblem"
            src={`/images/clans/${slug}.png`}
            alt=""
            onError={() => setFailed(true)}
        />
    );
}

/**
 * Page d'index des Clans : grille de cartes illustrées avec recherche par
 * nom, plutôt que la liste générique (`SectionIndexView`) utilisée par les
 * autres collections. L'accroche de chaque carte vient de la propriété
 * Notion "Accroche" (absente pour l'instant : la carte s'affiche sans,
 * en attendant que la propriété soit renseignée).
 */
export default function ClansIndexView({ wiki }) {

    const { activeNavigation } = wiki.navigation;
    const { loadedCollections, computed } = wiki.collections;
    const { loading } = computed;

    const [query, setQuery] = useState("");

    const collectionKey = activeNavigation.collections[0];
    const collection = loadedCollections[collectionKey];

    const normalizedQuery = query.trim().toLowerCase();
    const items = (collection?.items || []).filter((item) =>
        item.title.toLowerCase().includes(normalizedQuery)
    );

    return (
        <section className="pageView indexView">

            <IndexPageHeader icon={activeNavigation.icon} label={activeNavigation.label} />

            {!loading && collection?.description ? (
                <p className="indexIntro">{collection.description}</p>
            ) : null}

            <label className="pageSearchField">
                <Search size={18} aria-hidden="true" />
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Rechercher un clan..."
                />
            </label>

            {loading ? (
                <LoadingState message="Chargement..." />
            ) : (
                <div className="clanGrid">
                    {items.map((item) => (
                        <Link key={item.id} to={`${activeNavigation.path}/${item.slug}`} className="clanCard">
                            <ClanEmblem slug={item.slug} />

                            <span className="clanCardBody">
                                <strong>{item.title}</strong>
                                {item.properties?.Accroche?.value ? (
                                    <p>{item.properties.Accroche.value}</p>
                                ) : null}
                            </span>

                            <ChevronRight className="rowArrow" size={18} aria-hidden="true" />
                        </Link>
                    ))}

                    {items.length === 0 ? <p className="empty">Aucun clan ne correspond à ta recherche.</p> : null}
                </div>
            )}

        </section>
    );

}
