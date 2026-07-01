import { TriangleAlert } from "lucide-react";

export default function ErrorState({
    title = "Une erreur est survenue",
    message = "Impossible de charger cette ressource.",
}) {
    return (
        <div className="placeholder">
            <TriangleAlert size={34} />

            <h2>{title}</h2>

            <p>{message}</p>
        </div>
    );
}