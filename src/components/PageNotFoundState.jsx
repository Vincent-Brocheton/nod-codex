import { FileQuestion } from "lucide-react";

export default function PageNotFoundState({
    title = "Fiche introuvable",
    message = "Cette fiche n'existe pas ou n'est plus disponible.",
}) {
    return (
        <div className="placeholder">
            <FileQuestion size={34} />

            <h2>{title}</h2>

            <p>{message}</p>
        </div>
    );
}