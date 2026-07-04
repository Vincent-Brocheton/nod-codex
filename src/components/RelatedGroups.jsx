import { Link } from "react-router-dom";
import collectionNavPath from "../utils/collectionNavPath";

/**
 * Regroupe des relations directes d'une fiche (ex. les Disciplines, Atouts
 * et Handicaps d'un Clan) en listes de liens cliquables. `groups` est une
 * liste de { key, label } où `key` est le nom de la propriété relation.
 */
export default function RelatedGroups({ item, groups }) {

    const resolved = groups.map(({ key, label }) => {
        const property = item.properties?.[key];
        const refs = property?.type === "relation" ? property.value : [];
        return { key, label, refs };
    });

    return (
        <div className="relatedGroups">
            {resolved.map(({ key, label, refs }) => (
                <section key={key} className="relatedGroup">

                    <h2>{label}</h2>

                    {refs.length === 0 ? (
                        <p className="empty">Aucune fiche liée pour le moment.</p>
                    ) : (
                        <div className="relatedList">
                            {refs.map((ref) => {
                                const path = collectionNavPath(ref.collectionKey);
                                const linkKey = `${ref.collectionKey}/${ref.slug}`;

                                return path ? (
                                    <Link key={linkKey} to={`${path}/${ref.slug}`} className="relatedRow">
                                        <span>{ref.title}</span>
                                    </Link>
                                ) : (
                                    <span key={linkKey} className="relatedRow">
                                        <span>{ref.title}</span>
                                    </span>
                                );
                            })}
                        </div>
                    )}

                </section>
            ))}
        </div>
    );

}
