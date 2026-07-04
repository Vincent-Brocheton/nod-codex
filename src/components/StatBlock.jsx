import PropertyValue from "./PropertyValue";
import findPropertyValue from "../utils/findPropertyValue";
import { normalizeProperty, isPropertyEmpty } from "../utils/property";

/**
 * Bandeau de statistiques (ex. Focus/Jets d'une Discipline, Niveau/Coût
 * d'un rituel). Chaque champ se résout soit par clé exacte (`key`), soit
 * par mots-clés tolérants aux variantes de nommage Notion (`tokens`).
 * Les champs absents ou vides sont simplement ignorés.
 */
export default function StatBlock({ item, fields }) {

    const stats = fields
        .map(({ label, key, tokens }) => {
            const raw = tokens ? findPropertyValue(item, tokens) : item.properties?.[key];
            return { label, property: normalizeProperty(raw) };
        })
        .filter(({ property }) => !isPropertyEmpty(property));

    if (!stats.length) return null;

    return (
        <div className="statBlock">
            {stats.map(({ label, property }) => (
                <div key={label} className="statCard">
                    <span className="statLabel">{label}</span>
                    <strong><PropertyValue property={property} /></strong>
                </div>
            ))}
        </div>
    );

}
