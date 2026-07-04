import "../styles.css";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ItemList from "../components/ItemList";
import DetailPanel from "../components/DetailPanel";
import RitualsView from "../components/views/RitualsView";
import MeritsFlawsView from "../components/views/MeritsFlawsView";
import SectionIndexView from "../components/views/SectionIndexView";
import useWiki from "../hooks/useWiki";
import { useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import PageRenderer from "../components/PageRenderer";

function HomePage() {
    const { section, slug, collectionKey, niveau } = useParams();
    const [navOpen, setNavOpen] = useState(false);

    const wiki = useWiki({
        section,
        slug,
    });

    useEffect(() => {
        setNavOpen(false);
    }, [section, slug, collectionKey, niveau]);

    if (
        !wiki.loading &&
        !wiki.navigation.sectionExists
    ) {
        return <NotFoundPage />;
    }
    return (
        <main className="wikiShell">

            <header className="mobileTopBar">
                <button
                    className="mobileMenuButton"
                    onClick={() => setNavOpen(true)}
                    aria-label="Ouvrir la navigation"
                >
                    <Menu size={22} />
                </button>
                <strong>Wiki Vampire</strong>
            </header>

            <Sidebar wiki={wiki} open={navOpen} onClose={() => setNavOpen(false)} />

            {
                wiki.navigation.activeNavigation?.type === "collection"

                    ? (
                        wiki.navigation.activeNavigation.view === "rituals"

                            ? (
                                <RitualsView wiki={wiki} collectionKey={collectionKey} niveau={niveau} />
                            )

                            : wiki.navigation.activeNavigation.view === "merits-flaws"

                                ? (
                                    <MeritsFlawsView wiki={wiki} collectionKey={collectionKey} groupValue={niveau} />
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

