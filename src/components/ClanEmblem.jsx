import { useState } from "react";

/**
 * Emblème d'un clan (illustration dédiée par fiche, voir public/images/clans).
 * Retombe sur un sigle de classement (3 premières lettres, même langage que
 * les codes des cartes "Accès rapide") si le fichier n'existe pas encore,
 * plutôt qu'une icône générique identique pour tous les clans. Partagé entre
 * l'index des Clans et la fiche de détail.
 */
export default function ClanEmblem({ slug, title }) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        const code = title.replace(/[^\p{L}]/gu, "").slice(0, 3).toUpperCase();

        return (
            <span className="clanEmblem clanEmblemFallback" aria-hidden="true">
                {code}
            </span>
        );
    }

    return (
        <img
            className="clanEmblem"
            src={`/images/clans/${slug}.png`}
            alt=""
            onError={() => setFailed(true)}
        />
    );
}
