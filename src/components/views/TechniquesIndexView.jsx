import { Link } from "react-router-dom";
import { Feather } from "lucide-react";
import AppIcon from "../AppIcon";
import IndexPageHeader from "../IndexPageHeader";
import LoadingState from "../States/LoadingState";
import { techniquePrereqText } from "../../utils/techniques";

/**
 * Page d'index des Techniques : liste simple (pas d'icône dédiée par fiche
 * ni de recherche, contrairement à Clans/Disciplines — une collection plus
 * modeste ne le justifie pas), avec un encart dédié tant qu'aucune fiche
 * n'est encore publiée.
 */
export default function TechniquesIndexView({ wiki }) {

    const { activeNavigation } = wiki.navigation;
    const { loadedCollections, computed } = wiki.collections;
    const { loading } = computed;

    const collectionKey = activeNavigation.collections[0];
    const collection = loadedCollections[collectionKey];
    const items = collection?.items || [];

    return (
        <section className="pageView indexView">

            <IndexPageHeader icon={activeNavigation.icon} label={activeNavigation.label} />

            {!loading ? (
                <p className="indexIntro">
                    {collection?.description || "Voici les techniques de la chronique."}
                </p>
            ) : null}

            {loading ? (
                <LoadingState message="Chargement..." />
            ) : items.length === 0 ? (
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
                </div>
            )}

        </section>
    );

}
