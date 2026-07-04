import { Link } from "react-router-dom";
import { Shield, Sparkles, Swords, Brain, Star } from "lucide-react";

const steps = [
    { path: "/clans", icon: Shield, label: "Clans", description: "Choisis le clan de ton personnage." },
    { path: "/disciplines", icon: Sparkles, label: "Disciplines", description: "Découvre les pouvoirs vampiriques disponibles." },
    { path: "/techniques", icon: Swords, label: "Techniques", description: "Complète ta fiche avec des techniques de combat." },
    { path: "/competences", icon: Brain, label: "Compétences", description: "Répartis les compétences de ton personnage." },
    { path: "/atouts", icon: Star, label: "Atouts & Handicaps", description: "Affine ton personnage avec des atouts et handicaps." },
];

export default function CharacterCreationView() {
    return (
        <main>
            <section className="pageView homeView">

                <span className="eyebrow">Règles</span>

                <h1>Créer son personnage</h1>

                <p>
                    La création d'un personnage se fait en plusieurs étapes : choisis un clan, puis
                    complète ta fiche avec des disciplines, des techniques, des compétences ainsi que
                    des atouts et handicaps. Chaque section ci-dessous détaille les règles et les
                    options disponibles.
                </p>

                <div className="creationSteps">
                    {steps.map(({ path, icon: Icon, label, description }) => (
                        <Link key={path} to={path} className="creationStep">
                            <Icon aria-hidden="true" size={20} />
                            <div>
                                <strong>{label}</strong>
                                <span>{description}</span>
                            </div>
                        </Link>
                    ))}
                </div>

            </section>
        </main>
    );
}
