import { LoaderCircle } from "lucide-react";

export default function LoadingState({
    message = "Chargement...",
}) {
    return (
        <div className="placeholder">
            <LoaderCircle
                size={34}
                className="spin"
            />

            <p>{message}</p>
        </div>
    );
}