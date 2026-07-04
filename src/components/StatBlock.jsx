import PropertyValue from "./PropertyValue";
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
 * séparateur ", " par défaut.
 */
export default function StatBlock({ item, fields }) {

    const stats = fields
        .map(({ label, key, tokens, separator }) => {
            const raw = tokens ? findPropertyValue(item, tokens) : item.properties?.[key];
            return { label, property: normalizeProperty(raw), separator };
        })
        .filter(({ property }) => !isPropertyEmpty(property));

    if (!stats.length) return null;

    return (
        <div className="statBlock">
            {stats.map(({ label, property, separator }) => (
                <div key={label} className="statCard">
                    <span className="statLabel">{label}</span>
                    <strong>
                        {separator && Array.isArray(property.value)
                            ? property.value.join(separator)
                            : <PropertyValue property={property} />}
                    </strong>
                </div>
            ))}
        </div>
    );

}
