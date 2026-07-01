import { BookOpen, Search, Database } from "lucide-react";

function Sidebar({ wiki }) {
  const { manifest, collections, search } = wiki;
  const { state, actions, computed } = collections;
  const { groupedCollections } = computed;
  const { query, setQuery } = search;
  return <aside className="sidebar">
    <div className="brand">
      <BookOpen aria-hidden="true" size={28} />
      <div>
        <strong>Wiki Vampirs</strong>
        <span>{manifest.collections.length} bases sÃ©parÃ ©estetetet</span>
      </div>
    </div>

    <label className="searchField">
      <Search aria-hidden="true" size={18} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Rechercher dans la base"
      />
    </label>

    <nav className="collectionNav" aria-label="Bases Notion">
      {[...groupedCollections.entries()].map(([group, collections]) => (
        <section key={group}>
          <h2>{group}</h2>
          {collections.map((collection) => (
            <button
              key={collection.key}
              className={collection.key === state.activeCollectionKey ? "active" : ""}
              onClick={() => {
                actions.selectCollection(collection)
              }}
            >
              <Database aria-hidden="true" size={16} />
              {collection.label}
            </button>
          ))}
        </section>
      ))}
    </nav>
  </aside>
}

export default Sidebar;