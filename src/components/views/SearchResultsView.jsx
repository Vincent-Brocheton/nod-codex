import { Link } from "react-router-dom";
import { FileText, Search } from "lucide-react";
import LoadingState from "../States/LoadingState";
import collectionNavPath from "../../utils/collectionNavPath";

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

    const groups = groupByCollection(results);

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
                            {results.length} résultat{results.length > 1 ? "s" : ""}.
                        </p>

                        {groups.map((group) => (
                            <div key={group.label} className="indexGroup">

                                <h2>{group.label}</h2>

                                <ul className="indexList">
                                    {group.items.map((item) => (
                                        <li key={item.id}>
                                            <Link
                                                to={`${collectionNavPath(item.collectionKey)}/${item.slug}`}
                                                className="indexListItem"
                                                onClick={() => setQuery("")}
                                            >
                                                <FileText size={16} aria-hidden="true" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>

                            </div>
                        ))}

                        {results.length === 0 ? (
                            <p className="empty">Aucun résultat pour cette recherche.</p>
                        ) : null}
                    </>
                )}

            </section>
        </div>
    );

}
