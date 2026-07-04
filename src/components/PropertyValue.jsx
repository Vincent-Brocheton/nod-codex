import { Link } from "react-router-dom";
import collectionNavPath from "../utils/collectionNavPath";

export default function PropertyValue({ property }) {

    const { type, value } = property;

    if (type === "checkbox") return value ? "Oui" : "Non";

    if (type === "relation") {
        return (
            <div className="relationList">
                {value.map((ref) => {
                    const path = collectionNavPath(ref.collectionKey);
                    const key = `${ref.collectionKey}/${ref.slug}`;

                    return path ? (
                        <Link key={key} to={`${path}/${ref.slug}`} className="relationChip">
                            {ref.title}
                        </Link>
                    ) : (
                        <span key={key} className="relationChip">{ref.title}</span>
                    );
                })}
            </div>
        );
    }

    if (type === "relation-unresolved") {
        return <span className="relationPending">{value.length} fiche(s) liée(s)</span>;
    }

    if (type === "url" && value) {
        return <a href={value} target="_blank" rel="noreferrer">{value}</a>;
    }

    if (Array.isArray(value)) return value.join(", ");

    return String(value);

}
