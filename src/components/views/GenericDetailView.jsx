import DetailShell from "../DetailShell";
import ItemDetailBody from "../ItemDetailBody";

export default function GenericDetailView({ wiki }) {

    const { activeNavigation } = wiki.navigation;

    return (
        <DetailShell wiki={wiki} backPath={activeNavigation.path}>
            {(activeItem) => <ItemDetailBody item={activeItem} />}
        </DetailShell>
    );

}
