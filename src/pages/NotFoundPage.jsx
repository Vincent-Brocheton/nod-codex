import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
    return (
        <main className="">
            <section className="notFoundPage">

                <Compass size={64} />

                <h1>404</h1>

                <h2>Cette section du wiki n'existe pas.</h2>

                <p>
                    Vérifie l'adresse ou retourne à l'accueil du wiki.
                </p>

                <Link to="/" className="primaryButton">
                    Retour à l'accueil
                </Link>

            </section>
        </main>
    );
}