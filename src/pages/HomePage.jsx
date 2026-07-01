import "../styles.css";
import Sidebar from "../components/Sidebar";
import ItemList from "../components/ItemList";
import DetailPanel from "../components/DetailPanel";
import useWiki from "../hooks/useWiki";
import { useParams } from "react-router-dom";

function HomePage() {
    const { section, slug } = useParams();

    const wiki = useWiki({
        section,
        slug,
    });

    return (
        <main className="wikiShell">
            <Sidebar wiki={wiki} />

            <ItemList wiki={wiki} />

            <DetailPanel wiki={wiki} />
        </main>
    );
}

export default HomePage;

