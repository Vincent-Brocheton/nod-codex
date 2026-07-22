import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import LoadingState from "../States/LoadingState";
import IndexPageHeader from "../IndexPageHeader";
import disciplineIcon from "../../utils/disciplineIcon";
import { powersForDiscipline } from "../../utils/disciplinePowers";
import groupByCategory from "../../utils/groupByCategory";

/**
 * Page d'index des Disciplines : liste illustrée (icône générique par
 * discipline, voir `disciplineIcon`) avec recherche par nom, tri A-Z/Z-A et
 * le nombre de pouvoirs par discipline (Pouvoirs + Pouvoirs d'Anciens
 * confondus). Remplace la liste générique (`SectionIndexView`), sur le même
 * principe que `ClansIndexView`.
 *
 * Regroupée par la propriété "Type" (Commune / Exotique pour une discipline
 * à part entière, Thaumaturgie / Nécromancie / Elementaire / Assamite pour
 * une Voie qui en dépend) plutôt qu'une seule liste A-Z de 43 fiches où les
 * ~25 "Voie de/du/des..." noient les 18 disciplines à part entière. Même
 * utilitaire de groupement que RulesIndexView, réordonné ensuite : Commune
 * et Exotique (les disciplines à part entière) passent devant les types de
 * Voie, qui restent alphabétiques entre eux.
 */
const TYPE_PRIORITY = ["Commune", "Exotique"];

function orderByTypePriority(groups) {
    const prioritized = TYPE_PRIORITY
        .map((key) => groups.find((group) => group.key === key))
        .filter(Boolean);

    const rest = groups.filter((group) => !TYPE_PRIORITY.includes(group.key));

    return [...prioritized, ...rest];
}

export default function DisciplinesIndexView({ wiki }) {

    const { activeNavigation } = wiki.navigation;
    const { loadedCollections, computed } = wiki.collections;
    const { loading } = computed;

    const [query, setQuery] = useState("");

    const collectionKey = activeNavigation.collections[0];
    const collection = loadedCollections[collectionKey];
    const powers = loadedCollections.pouvoirs;
    const powersAnciens = loadedCollections["pouvoirs-anciens"];

    function powerCount(slug) {
        return powersForDiscipline(powers, slug).length + powersForDiscipline(powersAnciens, slug).length;
    }

    function sortItems(list) {
        return [...list].sort((a, b) => a.title.localeCompare(b.title, "fr"));
    }

    const allItems = collection?.items || [];

    const normalizedQuery = query.trim().toLowerCase();

    const filtered = allItems.filter((item) =>
        item.title.toLowerCase().includes(normalizedQuery)
    );

    const groups = orderByTypePriority(groupByCategory(filtered, "Type"))
        .map((group) => ({ ...group, items: sortItems(group.items) }));

    return (
        <section className="pageView indexView">

            <IndexPageHeader icon={activeNavigation.icon} label={activeNavigation.label} />

            {!loading && collection?.description ? (
                <p className="indexIntro">{collection.description}</p>
            ) : null}

            <div className="listToolbar">
                <label className="pageSearchField">
                    <Search size={18} aria-hidden="true" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Rechercher une discipline..."
                    />
                </label>
            </div>

            {loading ? (
                <LoadingState message="Chargement..." />
            ) : (
                <>
                    {groups.map((group) => (
                        <div key={group.key} className="indexGroup">

                            <h2>{group.label}</h2>

                            <div className="listRows">
                                {group.items.map((item) => {
                                    const Icon = disciplineIcon(item.slug);
                                    const count = powerCount(item.slug);

                                    return (
                                        <Link key={item.id} to={`${activeNavigation.path}/${item.slug}`} className="listRow">
                                            <span className="disciplineIcon" aria-hidden="true">
                                                <Icon size={22} />
                                            </span>

                                            <span className="disciplineBody">
                                                <strong>{item.title}</strong>
                                                {item.properties?.Accroche?.value ? (
                                                    <p>{item.properties.Accroche.value}</p>
                                                ) : null}
                                            </span>

                                            <span className="disciplineCount">{count} fiche{count > 1 ? "s" : ""}</span>

                                            <ChevronRight className="rowArrow" size={18} aria-hidden="true" />
                                        </Link>
                                    );
                                })}
                            </div>

                        </div>
                    ))}

                    {groups.length === 0 ? <p className="empty">Aucune discipline ne correspond à ta recherche.</p> : null}
                </>
            )}

        </section>
    );

}
