import { useEffect, useRef, useState } from "react";
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
    const panelRef = useRef(null);

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

    // Piège le focus clavier dans la popup (Tab/Shift+Tab ne doivent pas
    // atteindre la page derrière) et le restitue à l'élément qui l'a ouverte
    // une fois fermée, plutôt que de le laisser au corps de la page.
    useEffect(() => {
        const previouslyFocused = document.activeElement;
        panelRef.current?.focus();

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onClose();
                return;
            }

            if (event.key !== "Tab") return;

            const focusable = panelRef.current?.querySelectorAll(
                'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable || focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
        };
    }, [onClose]);

    return (
        <div className="modalBackdrop" onClick={onClose}>
            <div
                ref={panelRef}
                className="modalPanel"
                role="dialog"
                aria-modal="true"
                aria-label={item?.title || "Aperçu de la fiche"}
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
            >

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
