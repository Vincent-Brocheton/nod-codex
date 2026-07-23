import { Link } from "react-router-dom";
import { FileText, Search } from "lucide-react";
import LoadingState from "../States/LoadingState";
import collectionNavPath from "../../utils/collectionNavPath";
import { isLearnable } from "../../utils/techniques";

// Une technique dont un prérequis ne résout à aucune discipline existante
// n'est pas apprenable et est déjà exclue de la liste générale et des
// fiches Discipline (voir isLearnable) : elle ne doit pas non plus rester
// trouvable par la recherche globale, seul chemin qui y menait encore.
function isSearchable(item) {
    return item.collectionKey !== "techniques" || isLearnable(item);
}

function groupByCollection(results) {
    const groups = [];
    const byLabel = new Map();

    for (const item of results) {
        let group = byLabel.get(item.collectionLabel);

        if (!group) {
            group = { label: item.collectionLabel, items: [] };
            byLabel.set(item.collectionLabel, group);
            groups.push(group);
        }

        group.items.push(item);
    }

    return groups;
}

export default function SearchResultsView({ wiki }) {

    const { query, setQuery } = wiki.search;
    const { results, loading } = wiki.globalSearch;

    const searchableResults = results.filter(isSearchable);
    const groups = groupByCollection(searchableResults);

    return (
        <div className="pageArea">
            <section className="pageView indexView">

                <header className="indexHero">
                    <span className="indexHeroIcon">
                        <Search size={26} />
                    </span>

                    <div>
                        <span className="eyebrow">Recherche</span>
                        <h1>« {query.trim()} »</h1>
                    </div>
                </header>

                {loading ? (
                    <LoadingState message="Recherche en cours..." />
                ) : (
                    <>
                        <p className="indexIntro">
                            {searchableResults.length} résultat{searchableResults.length > 1 ? "s" : ""}.
                        </p>

                        {groups.map((group) => (
                            <div key={group.label} className="indexGroup">

                                <h2>{group.label}</h2>

                                <div className="listRows">
                                    {group.items.map((item) => (
                                        <Link
                                            key={item.id}
                                            to={`${collectionNavPath(item.collectionKey)}/${item.slug}`}
                                            className="listRow"
                                            onClick={() => setQuery("")}
                                        >
                                            <FileText size={16} aria-hidden="true" />
                                            <span className="listRowLabel">{item.title}</span>
                                        </Link>
                                    ))}
                                </div>

                            </div>
                        ))}

                        {searchableResults.length === 0 ? (
                            <p className="empty">Aucun résultat pour cette recherche.</p>
                        ) : null}
                    </>
                )}

            </section>
        </div>
    );

}
