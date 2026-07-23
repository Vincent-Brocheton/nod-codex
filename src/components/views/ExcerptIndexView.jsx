import { Link } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import IndexPageHeader from "../IndexPageHeader";
import LoadingState from "../States/LoadingState";
import AppIcon from "../AppIcon";
import useTitleFilter from "../../utils/useTitleFilter";
import firstParagraphExcerpt from "../../utils/firstParagraphExcerpt";

/**
 * Page d'index générique pour les collections "plates" (Historiques,
 * Attributs...) : recherche par nom + un aperçu (premier paragraphe de la
 * fiche) sous chaque titre, pour parcourir la liste sans ouvrir chaque fiche
 * une à une. Même gabarit que ClansIndexView, dont l'accroche vient en
 * revanche d'une propriété Notion dédiée. `searchLabel` (ex. "historique",
 * "attribut") vient de la config de navigation pour garder les phrases de
 * recherche/vide spécifiques à la collection.
 */
export default function ExcerptIndexView({ wiki }) {

    const { activeNavigation } = wiki.navigation;
    const { loadedCollections, computed } = wiki.collections;
    const { loading } = computed;

    const collectionKey = activeNavigation.collections[0];
    const collection = loadedCollections[collectionKey];
    const searchLabel = activeNavigation.searchLabel || activeNavigation.label.toLowerCase();

    const { query, setQuery, filtered } = useTitleFilter(collection?.items || []);
    const items = [...filtered].sort((a, b) => a.title.localeCompare(b.title, "fr"));

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
                    placeholder={`Rechercher un ${searchLabel}...`}
                />
            </label>

            {loading ? (
                <LoadingState message="Chargement..." />
            ) : (
                <div className="listRows">
                    {items.map((item) => (
                        <Link key={item.id} to={`${activeNavigation.path}/${item.slug}`} className="listRow listRowRich">
                            <span className="listRowIcon">
                                <AppIcon name={activeNavigation.icon} size={22} />
                            </span>
                            <strong>{item.title}</strong>
                            <p>{firstParagraphExcerpt(item.content)}</p>
                            <ChevronRight className="rowArrow" size={18} aria-hidden="true" />
                        </Link>
                    ))}

                    {items.length === 0 ? <p className="empty">Aucun {searchLabel} ne correspond à ta recherche.</p> : null}
                </div>
            )}

        </section>
    );

}
