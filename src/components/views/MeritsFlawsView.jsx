export default function MeritsFlawsView({wiki}) {
    const { loadedCollections } = wiki.collections;
    const { activeNavigation } = wiki.navigation;

    const collections = activeNavigation.collections
        .map(key => loadedCollections[key])
        .filter(Boolean);
    return (
        <div className="listPane">

            <h1>Atouts & Handicaps</h1>

            {collections.map(collection => (
                <section key={collection.key}>
                    <h2>{collection.label}</h2>
                </section>
            ))}

        </div>
    );

}