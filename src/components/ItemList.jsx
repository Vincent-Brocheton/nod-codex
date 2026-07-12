import ListView from "./views/ListView";
import DisciplinePowersView from "./views/DisciplinePowersView";
import CategorizedListView from "./views/CategorizedListView";
import LigneesListView from "./views/LigneesListView";

export default function ItemList({ wiki }) {

    const { activeNavigation } = wiki.navigation;

    switch (activeNavigation?.view) {

        case "discipline-powers":
            return <DisciplinePowersView wiki={wiki} />;

        case "grouped-list":
            return <CategorizedListView wiki={wiki} />;

        case "lignees":
            return <LigneesListView wiki={wiki} />;

        case "list":
        default:
            return <ListView wiki={wiki} />;
    }

}