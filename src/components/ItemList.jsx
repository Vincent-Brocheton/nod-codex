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

// `disciplineIcon`/`skillIcon` renvoient toutes deux un composant icône par
// slug (même contrat) : une seule fabrique pour les deux plutôt qu'une
// fonction dédiée par collection.
function iconResolver(resolve) {
    return (item) => {
        const Icon = resolve(item.slug);
        return <Icon size={17} aria-hidden="true" />;
    };
}

const disciplineIconFor = iconResolver(disciplineIcon);
const skillIconFor = iconResolver(skillIcon);

export default function ItemList({ wiki, onToggleListPane }) {

    const { activeNavigation } = wiki.navigation;

    switch (activeNavigation?.view) {

        case "discipline-powers":
            return <DisciplinePowersView wiki={wiki} onToggleListPane={onToggleListPane} />;

        case "grouped-list":
            return <CategorizedListView wiki={wiki} onToggleListPane={onToggleListPane} />;

        case "lignees":
            return <LigneesListView wiki={wiki} onToggleListPane={onToggleListPane} />;

        case "clans":
            return <IconListPane wiki={wiki} renderIcon={clanIcon} onToggleListPane={onToggleListPane} />;

        case "disciplines":
            return <IconListPane wiki={wiki} renderIcon={disciplineIconFor} onToggleListPane={onToggleListPane} />;

        case "techniques":
            return <IconListPane wiki={wiki} itemFilter={isLearnable} onToggleListPane={onToggleListPane} />;

        case "competences":
            return <IconListPane wiki={wiki} renderIcon={skillIconFor} onToggleListPane={onToggleListPane} />;

        case "list":
        default:
            return <ListView wiki={wiki} onToggleListPane={onToggleListPane} />;
    }

}