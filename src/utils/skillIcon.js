import {
    Activity,
    Car,
    Compass,
    Crosshair,
    Drama,
    Eye,
    EyeOff,
    FlaskConical,
    GraduationCap,
    Hammer,
    Hand,
    HeartHandshake,
    HelpCircle,
    Languages,
    Lock,
    Megaphone,
    Mic,
    Monitor,
    PawPrint,
    MapPin,
    Search,
    ShieldAlert,
    Sparkles,
    Stethoscope,
    Swords,
    Wind,
} from "lucide-react";

// Une icône thématique par compétence (même principe que `disciplineIcon`) :
// la liste des Compétences était la seule des grandes collections du site à
// répéter la même icône générique sur chaque ligne.
const ICONS = {
    animaux: PawPrint,
    "arme-a-feu": Crosshair,
    artisanat: Hammer,
    athletisme: Activity,
    bagarre: Hand,
    commandement: Megaphone,
    conduite: Car,
    empathie: HeartHandshake,
    erudition: GraduationCap,
    esquive: Wind,
    "experience-de-la-rue": MapPin,
    furtivite: EyeOff,
    informatique: Monitor,
    intimidation: ShieldAlert,
    investigation: Search,
    linguistique: Languages,
    medecine: Stethoscope,
    melee: Swords,
    mystere: HelpCircle,
    occultisme: Sparkles,
    representation: Mic,
    sciences: FlaskConical,
    securite: Lock,
    subterfuge: Drama,
    survie: Compass,
    vigilance: Eye,
};

export default function skillIcon(slug) {
    return ICONS[slug] || Sparkles;
}
