import DetailShell from "../DetailShell";
import ItemDetailBody from "../ItemDetailBody";

export default function GenericDetailView({ wiki, listCollapsed, onToggleListPane }) {

    const { activeNavigation } = wiki.navigation;

    return (
        <DetailShell
            wiki={wiki}
            backPath={activeNavigation.path}
            listCollapsed={listCollapsed}
            onToggleListPane={onToggleListPane}
        >
            {(activeItem) => <ItemDetailBody item={activeItem} manifest={wiki.manifest} />}
        </DetailShell>
    );

}
