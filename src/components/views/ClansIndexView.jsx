import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import IndexPageHeader from "../IndexPageHeader";
import LoadingState from "../States/LoadingState";
import ClanEmblem from "../ClanEmblem";

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
                <div className="listRows">
                    {items.map((item) => (
                        <Link key={item.id} to={`${activeNavigation.path}/${item.slug}`} className="listRow">
                            <ClanEmblem slug={item.slug} title={item.title} />

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
