import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ContentBlocks from "../ContentBlocks";
import LoadingState from "../States/LoadingState";
import EmptyState from "../States/EmptyState";

function ordreOf(item) {
    const value = item.properties?.Ordre?.value;
    return typeof value === "number" ? value : Infinity;
}

function sortByOrdre(items) {
    return [...items].sort((a, b) => ordreOf(a) - ordreOf(b));
}

/**
 * Parcours guidé "Créer son personnage" : une base Notion d'étapes
 * ordonnées (propriété Ordre), affichées une à la fois avec un bouton pour
 * avancer (libellé personnalisable via la propriété Bouton, ex. "Commencer"
 * sur la page de garde). L'étape courante est un état React local, jamais
 * reflété dans l'URL : impossible d'accéder à une étape directement par
 * lien, on repart toujours de la page de garde en arrivant sur la section.
 */
export default function CreationWizardView({ wiki }) {

    const { loadedCollections, computed } = wiki.collections;
    const { activeNavigation } = wiki.navigation;
    const { loading } = computed;

    const [stepIndex, setStepIndex] = useState(0);

    const collectionKey = activeNavigation.collections[0];
    const collection = loadedCollections[collectionKey];

    if (loading || !collection) {
        return (
            <div className="pageArea">
                <LoadingState message="Chargement..." />
            </div>
        );
    }

    const steps = sortByOrdre(collection.items);

    if (steps.length === 0) {
        return (
            <div className="pageArea">
                <EmptyState
                    title="Aucune étape pour le moment"
                    message="Aucune étape de création de personnage n'a encore été ajoutée."
                />
            </div>
        );
    }

    const currentIndex = Math.min(stepIndex, steps.length - 1);
    const current = steps[currentIndex];
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < steps.length - 1;

    const nextLabel = current.properties?.Bouton?.value || (hasNext ? "Étape suivante" : null);
    const progress = ((currentIndex + 1) / steps.length) * 100;

    return (
        <div className="pageArea">
            <article className="detailPane wizardPane">

                {hasPrevious ? (
                    <button type="button" className="wizardBack" onClick={() => setStepIndex((index) => index - 1)}>
                        <ArrowLeft aria-hidden="true" size={16} />
                        Étape précédente
                    </button>
                ) : null}

                <div className="wizardProgress">
                    <div className="wizardProgressBar" style={{ width: `${progress}%` }} />
                </div>

                <header>
                    <span>Créer son personnage</span>
                    <h1>{current.title}</h1>
                </header>

                <div className="detailCard">
                    <ContentBlocks content={current.content} />
                </div>

                {hasNext ? (
                    <button type="button" className="wizardNext" onClick={() => setStepIndex((index) => index + 1)}>
                        {nextLabel}
                    </button>
                ) : null}

            </article>
        </div>
    );

}
