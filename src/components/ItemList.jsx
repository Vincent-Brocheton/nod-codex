import ListView from "./views/ListView";
import DisciplinePowersView from "./views/DisciplinePowersView";

export default function ItemList({wiki}) {


    const {activeNavigation} = wiki.navigation;

    switch (activeNavigation?.view) {

        case "discipline-powers":
            return <DisciplinePowersView wiki={wiki}/>;

        case "list":
        default:
            return <ListView wiki={wiki}/>;
    }

}