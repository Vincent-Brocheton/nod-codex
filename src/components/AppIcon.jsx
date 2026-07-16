import {
    BookOpen,
    Brain,
    Crown,
    Cross,
    Database,
    Droplet,
    Flower,
    HelpCircle,
    Home,
    ScrollText,
    Shield,
    ShieldPlus,
    Skull,
    Sparkles,
    Star,
    Sword,
    Target,
    User,
    UserPlus,
} from "lucide-react";

// Pas d'équivalent direct dans lucide-react pour ces deux symboles
// (pentagramme, ânkh) : dessinés à la main dans le même style (traits,
// coins arrondis, viewBox 24x24) pour rester cohérents avec les icônes
// lucide utilisées partout ailleurs.
function Pentagram({ size = 16, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 5.5 13.47 9.98 18.18 9.99 14.38 12.77 15.82 17.26 12 14.5 8.18 17.26 9.62 12.77 5.82 9.99 10.53 9.98Z" />
        </svg>
    );
}

function Ankh({ size = 16, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="7" r="4" />
            <path d="M12 11v12M7 15h10" />
        </svg>
    );
}

// Symbole anarchiste ("cercle-A") : même logique, pas d'équivalent lucide.
function Anarchy({ size = 16, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 6 7 18M12 6l5 12M9 14h6" />
        </svg>
    );
}

const icons = {
    home: Home,
    "user-plus": UserPlus,
    user: User,

    shield: Shield,
    "shield-plus": ShieldPlus,
    sparkles: Sparkles,
    droplet: Droplet,
    swords: Sword,
    scroll: ScrollText,
    pentagram: Pentagram,
    brain: Brain,
    target: Target,
    star: Star,
    crown: Crown,
    cross: Cross,
    flower: Flower,
    skull: Skull,
    anarchy: Anarchy,

    "book-open": BookOpen,
    "help-circle": HelpCircle,

    ankh: Ankh,

    database: Database,
};

export default function AppIcon({
    name,
    size = 16,
    ...props
}) {

    const Component = icons[name] ?? Database;

    return (
        <Component
            size={size}
            {...props}
        />
    );
}
