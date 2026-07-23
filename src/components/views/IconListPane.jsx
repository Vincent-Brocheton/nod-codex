import { useNavigate } from "react-router-dom";
import ItemListButton from "../ItemListButton";
import ItemFlags from "../ItemFlags";
import ListPaneHeader from "../ListPaneHeader";
import LoadingState from "../States/LoadingState";

/**
 * Variante de `ListView` avec une icône propre à chaque fiche (emblème de
 * clan, icône de discipline/compétence...) plutôt que le même pictogramme
 * générique répété partout. Utilisée pour les collections qui ont déjà une
 * page d'index dédiée et soignée (Clans, Disciplines, Techniques,
 * Compétences) : la colonne liste, affichée une fois une fiche ouverte,
 * garde le même langage visuel au lieu de retomber sur `ListView`.
 *
 * `renderIcon(item)` est optionnel (retombe sur l'icône générique de
 * `ItemListButton` si absent, ex. pour les Techniques). `itemFilter` permet
 * d'exclure des fiches (ex. les techniques non apprenables, voir
 * `isLearnable`).
 */
export default function IconListPane({ wiki, renderIcon, itemFilter = () => true }) {

    const navigate = useNavigate();
    const { collections, navigation } = wiki;
    const { computed } = collections;
    const { activeCollections, visibleItems, loading } = computed;
    const activeCollection = activeCollections[0];
    const { activeNavigation } = navigation;

    const items = visibleItems.filter(itemFilter);

    return (
        <section className="listPane">
            <ListPaneHeader
                group={activeCollection?.group}
                label={activeCollection?.label}
                loading={loading}
                count={items.length}
            />

            {loading ? (
                <LoadingState message="Chargement des fiches..." />
            ) : (
                <div className="itemList">
                    {items.map((item) => (
                        <ItemListButton
                            key={item.id}
                            label={item.title}
                            selected={item.id === computed.activeItem?.id}
                            onClick={() => navigate(`${activeNavigation.path}/${item.slug}`)}
                            icon={renderIcon ? renderIcon(item) : undefined}
                            badges={(
                                <ItemFlags
                                    needsApproval={item.properties?.Approbation?.value === true}
                                    full={item.properties?.Complet?.value === true}
                                    compact
                                />
                            )}
                        />
                    ))}
                    {items.length === 0 ? <p className="empty">Aucune fiche dans cette base pour le moment.</p> : null}
                </div>
            )}
        </section>
    );

}
