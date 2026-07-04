import { BookOpen, Search, X } from "lucide-react";
import { navigation } from "../config/navigation";
import AppIcon from "./AppIcon";

export default function Sidebar({ wiki, open, onClose }) {

  const { search } = wiki;
  const { query, setQuery } = search;
  const { activeNavigation } = wiki.navigation;

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

          <div>
            <strong>Wiki Vampire</strong>
            <span>Règles du GN</span>
          </div>

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
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher..."
        />
      </label>

      <nav className="collectionNav">

        {navigation.map((section) => {

          const visibleChildren = section.children.filter(
            (item) => !item.hidden
          );

          if (!visibleChildren.length) return null;

          return (

            <section
              key={section.id}
              className="navigationSection"
            >

              <h2>{section.label}</h2>

              {visibleChildren.map((item) => (

                <button
                  key={item.id}
                  className={
                    item.id === activeNavigation?.id
                      ? "active"
                      : ""
                  }
                  onClick={() => handleNavigate(item)}
                >

                  <AppIcon
                    name={item.icon}
                    size={16}
                  />

                  <span>{item.label}</span>

                </button>

              ))}

            </section>

          );

        })}

      </nav>

      </aside>
    </>
  );
}