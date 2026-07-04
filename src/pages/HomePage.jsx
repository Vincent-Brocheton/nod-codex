import "../styles.css";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import WikiContent from "../components/WikiContent";
import ErrorState from "../components/States/ErrorState";
import useWiki from "../hooks/useWiki";
import { useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

function HomePage() {
    const { section, slug, collectionKey, groupValue } = useParams();
    const [navOpen, setNavOpen] = useState(false);

    const wiki = useWiki({
        section,
        slug,
    });

    useEffect(() => {
        setNavOpen(false);
    }, [section, slug, collectionKey, groupValue]);

    if (wiki.error) {
        return (
            <ErrorState message="Impossible de charger le wiki. Vérifie ta connexion et réessaie." />
        );
    }

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

            <WikiContent
                wiki={wiki}
                collectionKey={collectionKey}
                groupValue={groupValue}
                slug={slug}
            />

        </main>
    );
}

export default HomePage;
