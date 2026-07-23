import ListView from "./views/ListView";
import DisciplinePowersView from "./views/DisciplinePowersView";
import CategorizedListView from "./views/CategorizedListView";
import LigneesListView from "./views/LigneesListView";
import IconListPane from "./views/IconListPane";
import ClanEmblem from "./ClanEmblem";
import disciplineIcon from "../utils/disciplineIcon";
import skillIcon from "../utils/skillIcon";
import { isLearnable } from "../utils/techniques";

function clanIcon(item) {
    return <ClanEmblem slug={item.slug} title={item.title} />;
}

function disciplineIconFor(item) {
    const Icon = disciplineIcon(item.slug);
    return <Icon size={17} aria-hidden="true" />;
}

function skillIconFor(item) {
    const Icon = skillIcon(item.slug);
    return <Icon size={17} aria-hidden="true" />;
}

export default function ItemList({ wiki }) {

    const { activeNavigation } = wiki.navigation;

    switch (activeNavigation?.view) {

        case "discipline-powers":
            return <DisciplinePowersView wiki={wiki} />;

        case "grouped-list":
            return <CategorizedListView wiki={wiki} />;

        case "lignees":
            return <LigneesListView wiki={wiki} />;

        case "clans":
            return <IconListPane wiki={wiki} renderIcon={clanIcon} />;

        case "disciplines":
            return <IconListPane wiki={wiki} renderIcon={disciplineIconFor} />;

        case "techniques":
            return <IconListPane wiki={wiki} itemFilter={isLearnable} />;

        case "competences":
            return <IconListPane wiki={wiki} renderIcon={skillIconFor} />;

        case "list":
        default:
            return <ListView wiki={wiki} />;
    }

}