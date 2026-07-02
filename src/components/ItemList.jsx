import ListView from "./views/ListView";
import RitualsView from "./views/RitualsView";
import MeritsFlawsView from "./views/MeritsFlawsView";

export default function ItemList({ wiki }) {

    const { collections } = wiki;
    const { computed } = collections;

    const { activeNavigation } = computed;

    switch (activeNavigation?.view) {

        case "rituals":
            return <RitualsView wiki={wiki} />;

        case "merits-flaws":
            return <MeritsFlawsView wiki={wiki} />;

        case "list":
        default:
            return <ListView wiki={wiki} />;
    }

}