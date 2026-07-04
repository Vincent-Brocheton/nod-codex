import ListView from "./views/ListView";
import MeritsFlawsView from "./views/MeritsFlawsView";

export default function ItemList({wiki}) {


    const {activeNavigation} = wiki.navigation;

    switch (activeNavigation?.view) {

        case "merits-flaws":
            return <MeritsFlawsView wiki={wiki}/>;

        case "list":
        default:
            return <ListView wiki={wiki}/>;
    }

}