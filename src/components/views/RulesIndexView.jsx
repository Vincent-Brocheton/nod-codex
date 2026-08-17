import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import AppIcon from "../AppIcon";
import LoadingState from "../States/LoadingState";
import { applyGroupFilter } from "../../utils/groupFilter";
import groupByCategory from "../../utils/groupByCategory";
import { mergeCollectionItems } from "../../utils/mergeCollectionItems";

/**
 * Page d'index d'une collection (éventuellement plusieurs collections
 * fusionnées, voir `mergeCollectionItems`) groupée par catégorie (ex.
 * Règles), affichée tant qu'aucune fiche n'est sélectionnée. Reprend le même
 * regroupement que la colonne de liste (`CategorizedListView`), mais en
 * grille de cartes pleine largeur plutôt qu'en liste compacte, plus adaptée
 * à une page d'accueil de section qu'à une barre latérale.
 */
export default function RulesIndexView({ wiki, groupProperty = "Catégorie" }) {

    const { activeNavigation } = wiki.navigation;
    const { computed } = wiki.collections;
    const { activeCollections, loading } = computed;

    const groupFilter = activeNavigation.groupFilter;

    const items = mergeCollectionItems(activeCollections, groupProperty);
    const filteredItems = applyGroupFilter(items, groupFilter);
    const groups = groupByCategory(filteredItems, groupProperty);

    return (
        <section className="pageView indexView">

            <header className="indexHero">
                <span className="indexHeroIcon">
                    <AppIcon name={activeNavigation.icon} size={26} />
                </span>

                <div>
                    <span className="eyebrow">Règles</span>
                    <h1>{activeNavigation.label}</h1>
                </div>
            </header>

            {!loading ? (
                <p className="indexIntro">
                    {filteredItems.length} règle{filteredItems.length > 1 ? "s" : ""}, réparties en {groups.length} catégorie{groups.length > 1 ? "s" : ""}.
                </p>
            ) : null}

            {loading ? (
                <LoadingState message="Chargement..." />
            ) : (
                groups.map((group) => (
                    <div key={group.key} className="indexGroup">

                        <h2>{group.label}</h2>

                        <div className="listRows">
                            {group.items.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`${activeNavigation.path}/${item.slug}`}
                                    className="listRow"
                                >
                                    <FileText aria-hidden="true" size={17} />
                                    <span className="listRowLabel">{item.title}</span>
                                </Link>
                            ))}
                        </div>

                    </div>
                ))
            )}

            {!loading && groups.length === 0 ? (
                <p className="empty">Aucune fiche dans cette base pour le moment.</p>
            ) : null}

        </section>
    );

}
