import GenericDetailView from "./views/GenericDetailView";
import DisciplineDetailView from "./views/DisciplineDetailView";

export default function DetailPanel({ wiki }) {

    const { activeNavigation } = wiki.navigation;

    switch (activeNavigation?.detail) {

        case "discipline":
            return <DisciplineDetailView wiki={wiki} />;

        default:
            return <GenericDetailView wiki={wiki} />;
    }

}
