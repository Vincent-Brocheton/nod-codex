import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import AppIcon from "../AppIcon";
import ContentBlocks from "../ContentBlocks";
import LoadingState from "../States/LoadingState";
import EmptyState from "../States/EmptyState";

/**
 * FAQ affichée en accordéon (une question ouverte à la fois) plutôt qu'en
 * liste + détail comme les autres collections : le titre de chaque fiche
 * est la question, son contenu la réponse. `slug` (venu de l'URL, ex. un
 * résultat de recherche globale) pré-ouvre la question correspondante.
 */
export default function FaqView({ wiki, slug }) {

    const { loadedCollections, computed } = wiki.collections;
    const { activeNavigation } = wiki.navigation;
    const { loading } = computed;

    const [openId, setOpenId] = useState(null);

    const collectionKey = activeNavigation.collections[0];
    const collection = loadedCollections[collectionKey];

    useEffect(() => {
        if (!slug || !collection) return;

        const match = collection.items.find((item) => item.slug === slug);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (match) setOpenId(match.id);
    }, [slug, collection]);

    if (loading || !collection) {
        return (
            <div className="pageArea">
                <LoadingState message="Chargement..." />
            </div>
        );
    }

    const items = collection.items;

    if (items.length === 0) {
        return (
            <div className="pageArea">
                <EmptyState
                    title="Aucune question pour le moment"
                    message="Aucune question n'a encore été ajoutée à la FAQ."
                />
            </div>
        );
    }

    return (
        <div className="pageArea">
            <section className="pageView indexView">

                <header className="indexHero">
                    <span className="indexHeroIcon">
                        <AppIcon name={activeNavigation.icon} size={26} />
                    </span>

                    <div>
                        <span className="eyebrow">Ressources</span>
                        <h1>{activeNavigation.label}</h1>
                    </div>
                </header>

                <div className="faqList">
                    {items.map((item) => {
                        const open = item.id === openId;

                        return (
                            <div key={item.id} className={`faqEntry${open ? " open" : ""}`}>

                                <button
                                    type="button"
                                    className="faqQuestion"
                                    onClick={() => setOpenId(open ? null : item.id)}
                                    aria-expanded={open}
                                >
                                    <span>{item.title}</span>
                                    <ChevronDown className="faqChevron" size={18} aria-hidden="true" />
                                </button>

                                {open ? (
                                    <div className="faqAnswer">
                                        <ContentBlocks content={item.content} manifest={wiki.manifest} />
                                    </div>
                                ) : null}

                            </div>
                        );
                    })}
                </div>

            </section>
        </div>
    );

}
