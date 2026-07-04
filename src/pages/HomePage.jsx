import "../styles.css";
import Sidebar from "../components/Sidebar";
import ItemList from "../components/ItemList";
import DetailPanel from "../components/DetailPanel";
import RitualsView from "../components/views/RitualsView";
import SectionIndexView from "../components/views/SectionIndexView";
import useWiki from "../hooks/useWiki";
import { useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import PageRenderer from "../components/PageRenderer";

function HomePage() {
    const { section, slug, collectionKey, niveau } = useParams();

    const wiki = useWiki({
        section,
        slug,
    });
    if (
        !wiki.loading &&
        !wiki.navigation.sectionExists
    ) {
        return <NotFoundPage />;
    }
    return (
        <main className="wikiShell">
            <Sidebar wiki={wiki} />

            {
                wiki.navigation.activeNavigation?.type === "collection"

                    ? (
                        wiki.navigation.activeNavigation.view === "rituals"

                            ? (
                                <RitualsView wiki={wiki} collectionKey={collectionKey} niveau={niveau} />
                            )

                            : slug
                                ? (
                                    <>
                                        <ItemList wiki={wiki} />
                                        <DetailPanel wiki={wiki} />
                                    </>
                                )
                                : (
                                    <div className="pageArea">
                                        <SectionIndexView wiki={wiki} />
                                    </div>
                                )
                    )

                    : (
                        <div className="pageArea">
                            <PageRenderer wiki={wiki} />
                        </div>
                    )
            }
        </main>
    );
}

export default HomePage;

