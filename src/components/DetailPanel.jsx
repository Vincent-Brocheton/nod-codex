import GenericDetailView from "./views/GenericDetailView";

export default function DetailPanel({ wiki }) {

    const { activeNavigation } = wiki.navigation;

    switch (activeNavigation?.detail) {

        default:
            return <GenericDetailView wiki={wiki} />;
    }

}
