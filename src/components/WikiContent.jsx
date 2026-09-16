import { lazy, Suspense } from "react";
import ItemList from "./ItemList";
import DetailPanel from "./DetailPanel";
import LoadingState from "./States/LoadingState";

// Chargées à la demande plutôt qu'au démarrage : une seule de ces vues
// s'affiche à la fois (WikiContent n'en choisit qu'une selon la section
// active), donc les 12 restantes n'ont pas besoin d'alourdir le bundle
// initial pour un visiteur qui ne les visitera peut-être jamais.
const RitualsView = lazy(() => import("./views/RitualsView"));
const MeritsFlawsView = lazy(() => import("./views/MeritsFlawsView"));
const CreationWizardView = lazy(() => import("./views/CreationWizardView"));
const RulesIndexView = lazy(() => import("./views/RulesIndexView"));
const ClansIndexView = lazy(() => import("./views/ClansIndexView"));
const DisciplinesIndexView = lazy(() => import("./views/DisciplinesIndexView"));
const TechniquesIndexView = lazy(() => import("./views/TechniquesIndexView"));
const CompetencesIndexView = lazy(() => import("./views/CompetencesIndexView"));
const ExcerptIndexView = lazy(() => import("./views/ExcerptIndexView"));
const SectionIndexView = lazy(() => import("./views/SectionIndexView"));
const SearchResultsView = lazy(() => import("./views/SearchResultsView"));
const PageRenderer = lazy(() => import("./PageRenderer"));

/**
 * Choisit ce qu'il faut afficher à droite de la sidebar, selon le type de
 * page et, pour les collections, sa "view" et la présence d'un slug dans
 * l'URL (fiche précise vs simple index). Une recherche active prend le pas
 * sur tout le reste, quelle que soit la section affichée.
 */
export default function WikiContent({ wiki, collectionKey, groupValue, slug }) {
    return (
        <Suspense fallback={<LoadingState />}>
            {getContent({ wiki, collectionKey, groupValue, slug })}
        </Suspense>
    );
}

function getContent({ wiki, collectionKey, groupValue, slug }) {

    const { activeNavigation } = wiki.navigation;

    if (wiki.search.query.trim()) {
        return <SearchResultsView wiki={wiki} />;
    }

    if (activeNavigation?.type !== "collection") {
        return (
            <div className="pageArea">
                <PageRenderer wiki={wiki} />
            </div>
        );
    }

    if (activeNavigation.view === "rituals") {
        return <RitualsView wiki={wiki} collectionKey={collectionKey} groupValue={groupValue} />;
    }

    if (activeNavigation.view === "merits-flaws") {
        return <MeritsFlawsView wiki={wiki} collectionKey={collectionKey} groupValue={groupValue} />;
    }

    if (activeNavigation.view === "wizard") {
        return <CreationWizardView wiki={wiki} />;
    }

    if (activeNavigation.view === "grouped-list" && !slug) {
        return (
            <div className="pageArea">
                <RulesIndexView wiki={wiki} />
            </div>
        );
    }

    if (activeNavigation.view === "clans" && !slug) {
        return (
            <div className="pageArea">
                <ClansIndexView wiki={wiki} />
            </div>
        );
    }

    if (activeNavigation.view === "disciplines" && !slug) {
        return (
            <div className="pageArea">
                <DisciplinesIndexView wiki={wiki} />
            </div>
        );
    }

    if (activeNavigation.view === "techniques" && !slug) {
        return (
            <div className="pageArea">
                <TechniquesIndexView wiki={wiki} />
            </div>
        );
    }

    if (activeNavigation.view === "competences" && !slug) {
        return (
            <div className="pageArea">
                <CompetencesIndexView wiki={wiki} />
            </div>
        );
    }

    if ((activeNavigation.view === "historiques" || activeNavigation.view === "attributs") && !slug) {
        return (
            <div className="pageArea">
                <ExcerptIndexView wiki={wiki} />
            </div>
        );
    }

    if (slug) {
        return (
            <>
                <ItemList wiki={wiki} />
                <DetailPanel wiki={wiki} />
            </>
        );
    }

    return (
        <div className="pageArea">
            <SectionIndexView wiki={wiki} />
        </div>
    );

}
