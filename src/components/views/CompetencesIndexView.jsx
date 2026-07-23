import { Link } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import IndexPageHeader from "../IndexPageHeader";
import LoadingState from "../States/LoadingState";
import skillIcon from "../../utils/skillIcon";
import useTitleFilter from "../../utils/useTitleFilter";

/**
 * Page d'index des Compétences : recherche par nom + icône thématique par
 * fiche (voir `skillIcon`), plutôt que la liste générique (`SectionIndexView`)
 * qui répétait la même icône de section sur chaque ligne. Même gabarit que
 * ClansIndexView/DisciplinesIndexView.
 */
export default function CompetencesIndexView({ wiki }) {

    const { activeNavigation } = wiki.navigation;
    const { loadedCollections, computed } = wiki.collections;
    const { loading } = computed;

    const collectionKey = activeNavigation.collections[0];
    const collection = loadedCollections[collectionKey];

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
                    placeholder="Rechercher une compétence..."
                />
            </label>

            {loading ? (
                <LoadingState message="Chargement..." />
            ) : (
                <div className="listRows">
                    {items.map((item) => {
                        const Icon = skillIcon(item.slug);

                        return (
                            <Link key={item.id} to={`${activeNavigation.path}/${item.slug}`} className="listRow">
                                <Icon size={18} aria-hidden="true" />
                                <span className="listRowLabel">{item.title}</span>
                                <ChevronRight className="rowArrow" size={18} aria-hidden="true" />
                            </Link>
                        );
                    })}

                    {items.length === 0 ? <p className="empty">Aucune compétence ne correspond à ta recherche.</p> : null}
                </div>
            )}

        </section>
    );

}
