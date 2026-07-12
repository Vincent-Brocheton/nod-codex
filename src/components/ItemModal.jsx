import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getCollection } from "../services/wikiServices";
import ItemDetailBody from "./ItemDetailBody";
import StatBlock from "./StatBlock";
import ContentBlocks from "./ContentBlocks";
import LoadingState from "./States/LoadingState";

/**
 * Aperçu rapide d'une fiche liée, en popup, sans quitter la page en cours
 * (ex. un Atout de clan consulté depuis la fiche du Clan). Charge la
 * collection cible à la demande si elle n'est pas déjà en mémoire.
 * `statFields` restreint les propriétés affichées (par défaut : toutes,
 * comme sur une fiche normale) ; utile pour éviter des infos redondantes
 * avec le contexte d'où la popup a été ouverte (ex. le Clan déjà visible).
 */
export default function ItemModal({ manifest, collectionKey, slug, statFields, onClose }) {

    const [item, setItem] = useState(null);

    useEffect(() => {
        const config = manifest.collections.find((entry) => entry.key === collectionKey);
        if (!config) return;

        let cancelled = false;

        getCollection(config.file).then((collection) => {
            if (cancelled) return;

            const found = collection.items.find((entry) => entry.slug === slug);
            setItem(found ? { ...found, collectionLabel: collection.label } : null);
        });

        return () => {
            cancelled = true;
        };
    }, [manifest, collectionKey, slug]);

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="modalBackdrop" onClick={onClose}>
            <div className="modalPanel" onClick={(event) => event.stopPropagation()}>

                <button type="button" className="modalClose" onClick={onClose} aria-label="Fermer">
                    <X size={20} />
                </button>

                {!item ? (
                    <LoadingState />
                ) : (
                    <>
                        <header className="modalHeader">
                            <span>{item.collectionLabel}</span>
                            <h2>{item.title}</h2>
                        </header>

                        {statFields ? (
                            <>
                                <StatBlock item={item} fields={statFields} />
                                <ContentBlocks content={item.content} manifest={manifest} />
                            </>
                        ) : (
                            <ItemDetailBody item={item} manifest={manifest} />
                        )}
                    </>
                )}

            </div>
        </div>
    );

}
