import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingState from "../States/LoadingState";
import { disciplineRefs, powersForDiscipline } from "../../utils/disciplinePowers";

const GROUPS = [
    { key: "pouvoirs", label: "Pouvoirs" },
    { key: "pouvoirs-anciens", label: "Pouvoirs d'Anciens" },
];

export default function DisciplinePowersView({ wiki }) {

    const navigate = useNavigate();
    const { loadedCollections, computed } = wiki.collections;
    const { activeNavigation } = wiki.navigation;
    const { activeItem, loading } = computed;

    const discipline = disciplineRefs(activeItem)[0] || null;

    const groups = GROUPS.map(({ key, label }) => ({
        key,
        label,
        items: discipline ? powersForDiscipline(loadedCollections[key], discipline.slug) : [],
    }));

    return (
        <section className="listPane">

            <header>
                <span>Disciplines et Pouvoirs</span>
                <h1>{discipline ? discipline.title : "Pouvoirs"}</h1>
                {!loading && !discipline ? <p>Sélectionne un pouvoir depuis sa discipline.</p> : null}
            </header>

            {loading ? (
                <LoadingState message="Chargement des pouvoirs..." />
            ) : (
                <div className="itemList">
                    {groups.map((group) => (
                        <div key={group.key} className="itemGroup">

                            <h2>{group.label}</h2>

                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    className={item.id === activeItem?.id ? "selected" : ""}
                                    onClick={() => navigate(`${activeNavigation.path}/${item.slug}`)}
                                >
                                    <FileText aria-hidden="true" size={17} />
                                    <span>{item.title}</span>
                                </button>
                            ))}

                            {group.items.length === 0 ? (
                                <p className="empty">Aucun pouvoir dans cette catégorie.</p>
                            ) : null}

                        </div>
                    ))}
                </div>
            )}

        </section>
    );

}
