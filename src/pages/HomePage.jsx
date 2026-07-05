import "../styles.css";
import { useState } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import Sidebar from "../components/Sidebar";
import WikiContent from "../components/WikiContent";
import ErrorState from "../components/States/ErrorState";
import useWiki from "../hooks/useWiki";
import useTheme from "../hooks/useTheme";
import { useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

function HomePage() {
    const { section, slug, collectionKey, groupValue } = useParams();
    const [navOpen, setNavOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const wiki = useWiki({
        section,
        slug,
    });

    // Referme le menu mobile à chaque changement de route, en ajustant l'état
    // pendant le rendu plutôt que dans un effet (évite un rendu en cascade).
    const routeKey = `${section}/${slug}/${collectionKey}/${groupValue}`;
    const [prevRouteKey, setPrevRouteKey] = useState(routeKey);

    if (routeKey !== prevRouteKey) {
        setPrevRouteKey(routeKey);
        setNavOpen(false);
    }

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

                <button
                    className="themeToggle"
                    onClick={toggleTheme}
                    aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
                >
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>
            </header>

            <Sidebar
                wiki={wiki}
                open={navOpen}
                onClose={() => setNavOpen(false)}
                theme={theme}
                onToggleTheme={toggleTheme}
            />

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
