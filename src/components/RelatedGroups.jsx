import { useState } from "react";
import { Link } from "react-router-dom";
import collectionNavPath from "../utils/collectionNavPath";
import ItemModal from "./ItemModal";
import ItemFlags from "./ItemFlags";

/**
 * Regroupe des relations directes d'une fiche (ex. les Disciplines, Atouts
 * et Handicaps d'un Clan) en listes cliquables. `groups` est une liste de
 * { key, label, modal?, modalStatFields? } où `key` est le nom de la
 * propriété relation. Un groupe avec `modal: true` ouvre la fiche liée
 * dans une popup plutôt que de naviguer vers sa page (ex. Atouts/Handicaps
 * de clan, consultés rapidement sans quitter la fiche du Clan) ;
 * `modalStatFields` restreint les propriétés affichées dans cette popup
 * (par défaut : toutes, comme sur une fiche normale).
 */
// Fiches sans coût (ou hors contexte Atouts/Handicaps) reléguées en fin de
// liste plutôt que de perturber l'ordre des autres relations.
function coutValue(ref) {
    const value = Number(ref.cout);
    return Number.isFinite(value) ? value : Infinity;
}

export default function RelatedGroups({ item, groups, manifest }) {

    const [modalRef, setModalRef] = useState(null);

    const resolved = groups.map(({ key, label, modal = false, modalStatFields }) => {
        const property = item.properties?.[key];
        const refs = property?.type === "relation" ? property.value : [];
        const sortedRefs = [...refs].sort((a, b) => coutValue(a) - coutValue(b));
        return { key, label, refs: sortedRefs, modal, modalStatFields };
    });

    return (
        <div className="relatedGroups">
            {resolved.map(({ key, label, refs, modal, modalStatFields }) => (
                <section key={key} className="relatedGroup">

                    <h2>{label}</h2>

                    {refs.length === 0 ? (
                        <p className="empty">Aucune fiche liée pour le moment.</p>
                    ) : (
                        <div className="relatedList">
                            {refs.map((ref) => {
                                const linkKey = `${ref.collectionKey}/${ref.slug}`;
                                const content = (
                                    <>
                                        <span>{ref.title}</span>
                                        {ref.cout ? <span className="powerLevel">{ref.cout}</span> : null}
                                        <ItemFlags needsApproval={ref.approbation} full={ref.complet} compact />
                                    </>
                                );

                                if (modal) {
                                    return (
                                        <button
                                            key={linkKey}
                                            type="button"
                                            className="relatedRow"
                                            onClick={() => setModalRef({ ...ref, statFields: modalStatFields })}
                                        >
                                            {content}
                                        </button>
                                    );
                                }

                                const path = collectionNavPath(ref.collectionKey);

                                return path ? (
                                    <Link key={linkKey} to={`${path}/${ref.slug}`} className="relatedRow">
                                        {content}
                                    </Link>
                                ) : (
                                    <span key={linkKey} className="relatedRow">
                                        {content}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                </section>
            ))}

            {modalRef ? (
                <ItemModal
                    key={`${modalRef.collectionKey}/${modalRef.slug}`}
                    manifest={manifest}
                    collectionKey={modalRef.collectionKey}
                    slug={modalRef.slug}
                    statFields={modalRef.statFields}
                    onClose={() => setModalRef(null)}
                />
            ) : null}
        </div>
    );

}
