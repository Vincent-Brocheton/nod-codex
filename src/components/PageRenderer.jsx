import CharacterCreationView from "./CharacterCreationView";
import HomeView from "./HomeView";
import RulesView from "./RulesView";
import EmptyState from "./States/EmptyState";

export default function PageRenderer({ wiki }) {

    const { activeNavigation } = wiki.navigation;

    switch (activeNavigation?.id) {

        case "character-creation":
            return <CharacterCreationView />;

        case "rules-overview":
            return <RulesView />;

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