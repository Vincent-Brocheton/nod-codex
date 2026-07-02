import {
    BookOpen,
    Brain,
    Database,
    Home,
    ScrollText,
    Shield,
    Sparkles,
    Star,
    Sword,
    UserPlus,
} from "lucide-react";

const icons = {
    home: Home,
    "user-plus": UserPlus,

    shield: Shield,
    sparkles: Sparkles,
    swords: Sword,
    scroll: ScrollText,
    brain: Brain,
    star: Star,

    "book-open": BookOpen,

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