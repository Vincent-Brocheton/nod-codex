export default function RitualsView({ wiki }) {

    const { loadedCollections } = wiki.collections;
    const { activeNavigation } = wiki.navigation;

    const collections = activeNavigation.collections
        .map(key => loadedCollections[key])
        .filter(Boolean);

    return (
        <div className="listPane">

            <h1>Rituels</h1>

            {collections.map(collection => (
                <section key={collection.key}>
                    <h2>{collection.label}</h2>
                    <p>{collection.items.length} rituels</p>
                </section>
            ))}

        </div>
    );

}