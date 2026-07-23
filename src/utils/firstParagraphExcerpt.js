const MAX_LENGTH = 160;

/**
 * Résumé d'une fiche pour les pages d'index qui n'ont pas de propriété
 * "Accroche" dédiée (contrairement aux Clans) : on prend le premier bloc
 * "paragraph" du contenu Notion et on le coupe au dernier mot entier avant
 * `maxLength`, plutôt que de tronquer au milieu d'un mot.
 */
export default function firstParagraphExcerpt(content, maxLength = MAX_LENGTH) {
    const text = content?.find((block) => block.type === "paragraph")?.text?.trim();

    if (!text) {
        return "";
    }

    if (text.length <= maxLength) {
        return text;
    }

    const cut = text.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(" ");

    return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}
