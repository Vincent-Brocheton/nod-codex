import GenericDetailView from "./views/GenericDetailView";
import DisciplineDetailView from "./views/DisciplineDetailView";
import PowerDetailView from "./views/PowerDetailView";
import ClanDetailView from "./views/ClanDetailView";
import TechniqueDetailView from "./views/TechniqueDetailView";
import LigneeDetailView from "./views/LigneeDetailView";

export default function DetailPanel({ wiki }) {

    const { activeNavigation } = wiki.navigation;

    switch (activeNavigation?.detail) {

        case "discipline":
            return <DisciplineDetailView wiki={wiki} />;

        case "power":
            return <PowerDetailView wiki={wiki} />;

        case "clan":
            return <ClanDetailView wiki={wiki} />;

        case "technique":
            return <TechniqueDetailView wiki={wiki} />;

        case "lignee":
            return <LigneeDetailView wiki={wiki} />;

        default:
            return <GenericDetailView wiki={wiki} />;
    }

}
