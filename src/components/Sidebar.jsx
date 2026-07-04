import { BookOpen, Search } from "lucide-react";
import { navigation } from "../config/navigation";
import AppIcon from "./AppIcon";

export default function Sidebar({ wiki }) {

  const { search } = wiki;
  const { query, setQuery } = search;
  const { activeNavigation } = wiki.navigation;

  return (
    <aside className="sidebar">

      <div className="brand">
        <BookOpen size={28} />

        <div>
          <strong>Wiki Vampire</strong>
          <span>Règles du GN</span>
        </div>
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
                  onClick={() => wiki.open(item)}
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
  );
}