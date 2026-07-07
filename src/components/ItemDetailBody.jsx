import PropertyValue from "./PropertyValue";
import ContentBlocks from "./ContentBlocks";
import { getVisibleProperties } from "../utils/property";

/**
 * Corps d'une fiche : tableau de propriétés (non vides) + blocs de contenu.
 * Partagé entre les vues qui affichent une fiche unique (GenericDetailView)
 * et celles qui en empilent plusieurs (GroupedRuleView).
 */
export default function ItemDetailBody({ item, hideProperties = false }) {

    const properties = hideProperties ? [] : getVisibleProperties(item);

    return (
        <>
            {properties.length > 0 ? (
                <dl className="properties">
                    {properties.map(([name, property]) => (
                        <div key={name}>
                            <dt>{name}</dt>
                            <dd><PropertyValue property={property} /></dd>
                        </div>
                    ))}
                </dl>
            ) : null}

            <ContentBlocks content={item.content} />
        </>
    );

}
