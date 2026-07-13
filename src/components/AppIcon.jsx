import {
    BookOpen,
    Brain,
    Database,
    HelpCircle,
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
    "help-circle": HelpCircle,

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