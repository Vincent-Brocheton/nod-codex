import { BookOpen } from "lucide-react";

export default function EmptyState({
    title = "Aucune fiche sélectionnée",
    message = "Sélectionne une fiche pour l'afficher ici.",
}) {
    return (
        <div className="placeholder">
            <BookOpen size={34} />

            <h2>{title}</h2>

            <p>{message}</p>
        </div>
    );
}