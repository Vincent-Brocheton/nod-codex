import ItemList from "./ItemList";
import DetailPanel from "./DetailPanel";
import RitualsView from "./views/RitualsView";
import MeritsFlawsView from "./views/MeritsFlawsView";
import CreationWizardView from "./views/CreationWizardView";
import FaqView from "./views/FaqView";
import RulesIndexView from "./views/RulesIndexView";
import ClansIndexView from "./views/ClansIndexView";
import DisciplinesIndexView from "./views/DisciplinesIndexView";
import TechniquesIndexView from "./views/TechniquesIndexView";
import CompetencesIndexView from "./views/CompetencesIndexView";
import SectionIndexView from "./views/SectionIndexView";
import SearchResultsView from "./views/SearchResultsView";
import PageRenderer from "./PageRenderer";

/**
 * Choisit ce qu'il faut afficher à droite de la sidebar, selon le type de
 * page et, pour les collections, sa "view" et la présence d'un slug dans
 * l'URL (fiche précise vs simple index). Une recherche active prend le pas
 * sur tout le reste, quelle que soit la section affichée.
 */
export default function WikiContent({ wiki, collectionKey, groupValue, slug }) {

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

    if (activeNavigation.view === "faq") {
        return <FaqView wiki={wiki} slug={slug} />;
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
