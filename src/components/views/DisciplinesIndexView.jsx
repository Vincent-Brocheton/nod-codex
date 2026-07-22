import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import LoadingState from "../States/LoadingState";
import IndexPageHeader from "../IndexPageHeader";
import disciplineIcon from "../../utils/disciplineIcon";
import { powersForDiscipline } from "../../utils/disciplinePowers";

/**
 * Page d'index des Disciplines : liste illustrée (icône générique par
 * discipline, voir `disciplineIcon`) avec recherche par nom, tri A-Z/Z-A et
 * le nombre de pouvoirs par discipline (Pouvoirs + Pouvoirs d'Anciens
 * confondus). Remplace la liste générique (`SectionIndexView`), sur le même
 * principe que `ClansIndexView`.
 */
export default function DisciplinesIndexView({ wiki }) {

    const { activeNavigation } = wiki.navigation;
    const { loadedCollections, computed } = wiki.collections;
    const { loading } = computed;

    const [query, setQuery] = useState("");
    const [sortDir, setSortDir] = useState("asc");

    const collectionKey = activeNavigation.collections[0];
    const collection = loadedCollections[collectionKey];
    const powers = loadedCollections.pouvoirs;
    const powersAnciens = loadedCollections["pouvoirs-anciens"];

    function powerCount(slug) {
        return powersForDiscipline(powers, slug).length + powersForDiscipline(powersAnciens, slug).length;
    }

    const normalizedQuery = query.trim().toLowerCase();

    const items = (collection?.items || [])
        .filter((item) => item.title.toLowerCase().includes(normalizedQuery))
        .sort((a, b) => (sortDir === "asc"
            ? a.title.localeCompare(b.title, "fr")
            : b.title.localeCompare(a.title, "fr")));

    return (
        <section className="pageView indexView">

            <IndexPageHeader icon={activeNavigation.icon} label={activeNavigation.label} />

            {!loading ? (
                <p className="indexIntro">
                    Voici la liste des disciplines de la chronique ({collection?.items.length || 0} fiches).
                </p>
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

                <label className="sortField">
                    <select value={sortDir} onChange={(event) => setSortDir(event.target.value)}>
                        <option value="asc">A–Z</option>
                        <option value="desc">Z–A</option>
                    </select>
                    <ChevronDown size={16} aria-hidden="true" />
                </label>
            </div>

            {loading ? (
                <LoadingState message="Chargement..." />
            ) : (
                <div className="listRows">
                    {items.map((item) => {
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

                    {items.length === 0 ? <p className="empty">Aucune discipline ne correspond à ta recherche.</p> : null}
                </div>
            )}

        </section>
    );

}
