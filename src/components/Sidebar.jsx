import { Fragment, useEffect, useRef } from "react";
import { BookOpen, ChevronRight, Moon, Search, Sun, X } from "lucide-react";
import { navigation } from "../config/navigation";
import AppIcon from "./AppIcon";

export default function Sidebar({ wiki, open, onClose, theme, onToggleTheme }) {

    const { search } = wiki;
    const { query, setQuery } = search;
    const { activeNavigation } = wiki.navigation;

    const searchRef = useRef(null);

    // Raccourci ⌘K / Ctrl+K annoncé par l'infobulle du champ de recherche :
    // focus direct, où que soit l'utilisateur dans l'appli.
    useEffect(() => {
        function handleKeyDown(event) {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                searchRef.current?.focus();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    function handleNavigate(item) {
        wiki.open(item);
        onClose?.();
    }

    return (
        <>
            <div
                className={`sidebarBackdrop${open ? " visible" : ""}`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside className={`sidebar${open ? " open" : ""}`}>

                <div className="brand">
                    <BookOpen size={28} />

                    <strong>Wiki Vampire</strong>

                    {onToggleTheme ? (
                        <button
                            className="themeToggle"
                            onClick={onToggleTheme}
                            aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
                        >
                            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                    ) : null}

                    <button
                        className="sidebarClose"
                        onClick={onClose}
                        aria-label="Fermer la navigation"
                    >
                        <X size={20} />
                    </button>
                </div>

                <label className="searchField">
                    <Search size={18} />

                    <input
                        ref={searchRef}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Rechercher..."
                    />

                    <kbd className="searchShortcut">⌘K</kbd>
                </label>

                <nav className="collectionNav">
                    {navigation.map((section, index) => {
                        const visibleChildren = section.children.filter((item) => !item.hidden);

                        if (!visibleChildren.length) return null;

                        return (
                            <Fragment key={section.id}>
                                {index > 0 ? <div className="navDivider" aria-hidden="true"><span>✦</span></div> : null}

                                <section className="navigationSection">

                                    <h2>{section.label}</h2>

                                    {visibleChildren.map((item) => (
                                        <button
                                            key={item.id}
                                            className={item.id === activeNavigation?.id ? "active" : ""}
                                            onClick={() => handleNavigate(item)}
                                        >
                                            <AppIcon name={item.icon} size={16} />
                                            <span>{item.label}</span>
                                            {section.id === "rules" ? (
                                                <ChevronRight className="navChevron" size={16} aria-hidden="true" />
                                            ) : null}
                                        </button>
                                    ))}

                                </section>
                            </Fragment>
                        );
                    })}
                </nav>

                <div className="sidebarHero">
                    <blockquote>« La Mascarade nous protège. La chronique nous unit. »</blockquote>
                    <span className="sidebarHeroDivider" aria-hidden="true">✦</span>
                </div>

                <div className="sidebarFooter">
                    <AppIcon name="ankh" size={20} aria-hidden="true" />

                    <div>
                        <strong>Vampire la Mascarade</strong>
                        <span>Wiki de chronique</span>
                    </div>
                </div>

            </aside>
        </>
    );
}
