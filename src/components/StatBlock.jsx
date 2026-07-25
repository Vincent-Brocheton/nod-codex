import PropertyValue from "./PropertyValue";
import AppIcon from "./AppIcon";
import findPropertyValue from "../utils/findPropertyValue";
import { normalizeProperty, isPropertyEmpty } from "../utils/property";

/**
 * Bandeau de statistiques (ex. Focus/Jets d'une Discipline, Niveau/Coût
 * d'un rituel). Chaque champ se résout soit par clé exacte (`key`), soit
 * par mots-clés tolérants aux variantes de nommage Notion (`tokens`).
 * Les champs absents ou vides sont simplement ignorés.
 *
 * `separator` est optionnel : pour une valeur à choix multiples affichée
 * comme une formule (ex. un jet "Social + Empathie"), il remplace le
 * séparateur ", " par défaut. `icon`, optionnel, affiche un pictogramme
 * devant la valeur (ex. une goutte pour le Coût en sang) plutôt qu'un
 * chiffre nu.
 */
export default function StatBlock({ item, fields }) {

    const stats = fields
        .map(({ label, key, tokens, separator, icon }) => {
            const raw = tokens ? findPropertyValue(item, tokens) : item.properties?.[key];
            return { label, property: normalizeProperty(raw), separator, icon };
        })
        .filter(({ property }) => !isPropertyEmpty(property));

    if (!stats.length) return null;

    return (
        <div className="statBlock">
            {stats.map(({ label, property, separator, icon }) => (
                <div key={label} className="statCard">
                    <span className="statLabel">{label}</span>
                    <strong className={icon ? "withIcon" : undefined}>
                        {icon ? <AppIcon name={icon} size={14} aria-hidden="true" /> : null}
                        {separator && Array.isArray(property.value)
                            ? property.value.join(separator)
                            : <PropertyValue property={property} />}
                    </strong>
                </div>
            ))}
        </div>
    );

}
