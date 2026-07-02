import "../styles.css";
import Sidebar from "../components/Sidebar";
import ItemList from "../components/ItemList";
import DetailPanel from "../components/DetailPanel";
import useWiki from "../hooks/useWiki";
import { useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import PageRenderer from "../components/PageRenderer";

function HomePage() {
    const { section, slug } = useParams();

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
                        <>
                            <ItemList wiki={wiki} />
                            <DetailPanel wiki={wiki} />
                        </>
                    )

                    : (
                        <PageRenderer wiki={wiki} />
                    )
            }
        </main>
    );
}

export default HomePage;

