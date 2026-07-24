import GenericDetailView from "./views/GenericDetailView";
import DisciplineDetailView from "./views/DisciplineDetailView";
import PowerDetailView from "./views/PowerDetailView";
import ClanDetailView from "./views/ClanDetailView";
import TechniqueDetailView from "./views/TechniqueDetailView";
import LigneeDetailView from "./views/LigneeDetailView";

export default function DetailPanel({ wiki, listCollapsed, onToggleListPane }) {

    const { activeNavigation } = wiki.navigation;

    switch (activeNavigation?.detail) {

        case "discipline":
            return <DisciplineDetailView wiki={wiki} listCollapsed={listCollapsed} onToggleListPane={onToggleListPane} />;

        case "power":
            return <PowerDetailView wiki={wiki} listCollapsed={listCollapsed} onToggleListPane={onToggleListPane} />;

        case "clan":
            return <ClanDetailView wiki={wiki} listCollapsed={listCollapsed} onToggleListPane={onToggleListPane} />;

        case "technique":
            return <TechniqueDetailView wiki={wiki} listCollapsed={listCollapsed} onToggleListPane={onToggleListPane} />;

        case "lignee":
            return <LigneeDetailView wiki={wiki} listCollapsed={listCollapsed} onToggleListPane={onToggleListPane} />;

        default:
            return <GenericDetailView wiki={wiki} listCollapsed={listCollapsed} onToggleListPane={onToggleListPane} />;
    }

}
