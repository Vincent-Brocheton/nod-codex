import { Link } from "react-router-dom";
import ContentBlocks from "../ContentBlocks";
import StatBlock from "../StatBlock";
import DetailShell from "../DetailShell";
import { itemNiveau, powersForDiscipline } from "../../utils/disciplinePowers";
import { techniquePrereqText, techniquesForDiscipline } from "../../utils/techniques";
import collectionNavPath from "../../utils/collectionNavPath";

const STAT_FIELDS = [
    { label: "Focus principal", key: "Spécialité 1" },
    { label: "Focus secondaire", key: "Spécialité 2" },
    { label: "Jet d'attaque", key: "Jet d'attaque", separator: " + " },
    { label: "Jet de défense", key: "Jet de défense", separator: " + " },
];

const POWER_GROUPS = [
    { key: "pouvoirs", label: "Pouvoirs" },
    { key: "pouvoirs-anciens", label: "Pouvoirs d'Anciens" },
];

function levelLabel(item) {
    const value = itemNiveau(item);
    return Number.isFinite(value) ? value : "?";
}

export default function DisciplineDetailView({ wiki }) {

    const { loadedCollections } = wiki.collections;
    const { activeNavigation } = wiki.navigation;

    const powersPath = collectionNavPath("pouvoirs");
    const techniquesPath = collectionNavPath("techniques");

    return (
        <DetailShell
            wiki={wiki}
            backPath={activeNavigation.path}
            subtitle={(item) => item.properties?.Type?.value || null}
            subtitleLabel="Type"
        >
            {(activeItem) => {
                // Groupes masqués s'ils sont vides plutôt qu'un message
                // "Aucun..." systématique : ex. Pouvoirs d'Anciens ne
                // concerne aujourd'hui aucune Voie, mais rien à coder si ça
                // change demain, la section apparaîtra d'elle-même.
                const groups = POWER_GROUPS
                    .map(({ key, label }) => ({
                        key,
                        label,
                        items: powersForDiscipline(loadedCollections[key], activeItem.slug),
                    }))
                    .filter((group) => group.items.length > 0);

                const techniques = techniquesForDiscipline(loadedCollections.techniques, activeItem.slug);

                return (
                    <>
                        <StatBlock item={activeItem} fields={STAT_FIELDS} />

                        <ContentBlocks content={activeItem.content} manifest={wiki.manifest} />

                        <div className="relatedGroups">
                            {groups.map((group) => (
                                <section key={group.key} className="relatedGroup">

                                    <h2>{group.label}</h2>

                                    <div className="relatedList">
                                        {group.items.map((item) => {
                                            const content = (
                                                <>
                                                    <span className="powerLevel">{levelLabel(item)}</span>
                                                    <span>{item.title}</span>
                                                </>
                                            );

                                            return powersPath ? (
                                                <Link key={item.id} to={`${powersPath}/${item.slug}`} className="relatedRow">
                                                    {content}
                                                </Link>
                                            ) : (
                                                <span key={item.id} className="relatedRow">
                                                    {content}
                                                </span>
                                            );
                                        })}
                                    </div>

                                </section>
                            ))}

                            {techniques.length > 0 ? (
                                <section className="relatedGroup">

                                    <h2>Techniques</h2>

                                    <div className="listRows">
                                        {techniques.map((item) => {
                                            const prereqs = techniquePrereqText(item);
                                            const body = (
                                                <span className="techniqueBody">
                                                    <strong className="listRowLabel">{item.title}</strong>
                                                    {prereqs ? <span className="techniquePrereq">Prérequis : {prereqs}</span> : null}
                                                </span>
                                            );

                                            return techniquesPath ? (
                                                <Link key={item.id} to={`${techniquesPath}/${item.slug}`} className="listRow">
                                                    {body}
                                                </Link>
                                            ) : (
                                                <span key={item.id} className="listRow">
                                                    {body}
                                                </span>
                                            );
                                        })}
                                    </div>

                                </section>
                            ) : null}
                        </div>
                    </>
                );
            }}
        </DetailShell>
    );

}
