import HomeView from "./HomeView";
import RecentUpdatesView from "./views/RecentUpdatesView";
import EmptyState from "./States/EmptyState";

export default function PageRenderer({ wiki }) {

    const { activeNavigation } = wiki.navigation;

    switch (activeNavigation?.id) {

        case "home":
            return <HomeView wiki={wiki} />;

        case "recent-updates":
            return <RecentUpdatesView wiki={wiki} />;

        default:
            return (
                <EmptyState
                    title="Page indisponible"
                    message="Cette page n'existe pas encore."
                />
            );
    }

}