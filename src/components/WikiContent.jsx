import ItemList from "./ItemList";
import DetailPanel from "./DetailPanel";
import RitualsView from "./views/RitualsView";
import MeritsFlawsView from "./views/MeritsFlawsView";
import SectionIndexView from "./views/SectionIndexView";
import PageRenderer from "./PageRenderer";

/**
 * Choisit ce qu'il faut afficher à droite de la sidebar, selon le type de
 * page et, pour les collections, sa "view" et la présence d'un slug dans
 * l'URL (fiche précise vs simple index).
 */
export default function WikiContent({ wiki, collectionKey, groupValue, slug }) {

    const { activeNavigation } = wiki.navigation;

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
