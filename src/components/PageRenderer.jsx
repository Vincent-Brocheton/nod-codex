import HomeView from "./HomeView";
import EmptyState from "./States/EmptyState";

export default function PageRenderer({ wiki }) {

    const { activeNavigation } = wiki.navigation;

    switch (activeNavigation?.id) {

        case "home":
            return <HomeView />

        default:
            return (
                <EmptyState
                    title="Page indisponible"
                    message="Cette page n'existe pas encore."
                />
            );
    }

}