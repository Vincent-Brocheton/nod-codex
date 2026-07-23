import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Feather, Search } from "lucide-react";
import AppIcon from "../AppIcon";
import IndexPageHeader from "../IndexPageHeader";
import LoadingState from "../States/LoadingState";
import { isLearnable, techniquePrereqText } from "../../utils/techniques";
import useTitleFilter from "../../utils/useTitleFilter";

/**
 * Page d'index des Techniques : recherche par nom, triée alphabétiquement
 * (même gabarit que Clans/Disciplines), plus un encart dédié tant qu'aucune
 * fiche n'est encore publiée. Pas de groupement par discipline requise : une
 * technique peut avoir plusieurs disciplines en prérequis (voir
 * `Disciplines`, relation multiple), donc pas de partition propre possible.
 *
 * Les techniques dont un prérequis ne résout à aucune discipline existante
 * (ex. Visceratika, Melpominée : pas dans la base Disciplines) ne sont pas
 * réellement apprenables et sont exclues, voir `isLearnable`.
 */
export default function TechniquesIndexView({ wiki }) {

    const { activeNavigation } = wiki.navigation;
    const { loadedCollections, computed } = wiki.collections;
    const { loading } = computed;

    const collectionKey = activeNavigation.collections[0];
    const collection = loadedCollections[collectionKey];
    const allItems = useMemo(
        () => (collection?.items || []).filter(isLearnable),
        [collection]
    );

    const { query, setQuery, filtered } = useTitleFilter(allItems);
    const items = [...filtered].sort((a, b) => a.title.localeCompare(b.title, "fr"));

    return (
        <section className="pageView indexView">

            <IndexPageHeader icon={activeNavigation.icon} label={activeNavigation.label} />

            {!loading ? (
                <p className="indexIntro">
                    {collection?.description || "Voici les techniques de la chronique."}
                </p>
            ) : null}

            {!loading && allItems.length > 0 ? (
                <div className="listToolbar">
                    <label className="pageSearchField">
                        <Search size={18} aria-hidden="true" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Rechercher une technique..."
                        />
                    </label>
                </div>
            ) : null}

            {loading ? (
                <LoadingState message="Chargement..." />
            ) : allItems.length === 0 ? (
                <div className="techniquesEmpty">
                    <Feather size={40} aria-hidden="true" />

                    <h2>Aucune technique disponible pour le moment</h2>

                    <div className="pageTitleDivider techniquesEmptyDivider" aria-hidden="true"><span>✦</span></div>

                    <p>
                        Les techniques de la chronique sont en cours de rédaction.
                        De nouvelles fiches seront ajoutées prochainement.
                    </p>
                </div>
            ) : (
                <div className="listRows">
                    {items.map((item) => {
                        const prereqs = techniquePrereqText(item);

                        return (
                            <Link key={item.id} to={`${activeNavigation.path}/${item.slug}`} className="listRow">
                                <AppIcon name={activeNavigation.icon} size={16} aria-hidden="true" />

                                <span className="techniqueBody">
                                    <strong className="listRowLabel">{item.title}</strong>
                                    {prereqs ? <span className="techniquePrereq">Prérequis : {prereqs}</span> : null}
                                </span>
                            </Link>
                        );
                    })}

                    {items.length === 0 ? <p className="empty">Aucune technique ne correspond à ta recherche.</p> : null}
                </div>
            )}

        </section>
    );

}
