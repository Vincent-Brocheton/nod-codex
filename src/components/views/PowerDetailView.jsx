import { Link } from "react-router-dom";
import BlockRenderer from "../BlockRenderer";
import StatBlock from "../StatBlock";
import DetailShell from "../DetailShell";
import { disciplineRefs } from "../../utils/disciplinePowers";
import collectionNavPath from "../../utils/collectionNavPath";

const STAT_FIELDS = [
    { label: "Niveau", key: "Niveau" },
    { label: "Focus", key: "Focus" },
    { label: "Type d'action", key: "Type d'action" },
    { label: "Durée", key: "Durée" },
    { label: "Jet d'attaque", key: "Jet d'attaque", separator: " + " },
    { label: "Jet de défense", key: "Jet de défense", separator: " + " },
    { label: "Coût en sang", tokens: ["cout", "sang"] },
];

export default function PowerDetailView({ wiki }) {

    const { activeItem } = wiki.collections.computed;

    const discipline = disciplineRefs(activeItem)[0];
    const disciplinePath = discipline && collectionNavPath(discipline.collectionKey);
    const backPath = discipline && disciplinePath
        ? `${disciplinePath}/${discipline.slug}`
        : "/disciplines";

    return (
        <DetailShell wiki={wiki} backPath={backPath} backLabel="Retour à la discipline">
            {(item) => (
                <>
                    <StatBlock item={item} fields={STAT_FIELDS} />

                    {discipline ? (
                        <p className="metaLine">
                            Discipline :{" "}
                            {disciplinePath ? (
                                <Link to={`${disciplinePath}/${discipline.slug}`} className="relationChip">
                                    {discipline.title}
                                </Link>
                            ) : (
                                <span className="relationChip">{discipline.title}</span>
                            )}
                        </p>
                    ) : null}

                    <div className="contentBlocks">
                        {(item.content || []).map((block, index) => (
                            <BlockRenderer key={`${block.type}-${index}`} block={block} />
                        ))}
                    </div>
                </>
            )}
        </DetailShell>
    );

}
