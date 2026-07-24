import { useNavigate } from "react-router-dom";
import { PanelLeftClose } from "lucide-react";
import ItemListButton from "../ItemListButton";
import LoadingState from "../States/LoadingState";
import { disciplineRefs, powersForDiscipline } from "../../utils/disciplinePowers";

const GROUPS = [
    { key: "pouvoirs", label: "Pouvoirs" },
    { key: "pouvoirs-anciens", label: "Pouvoirs d'Anciens" },
];

export default function DisciplinePowersView({ wiki, onToggleListPane }) {

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

            <header className="listPaneHeader">
                <span>Disciplines et Pouvoirs</span>
                <h1>{discipline ? discipline.title : "Pouvoirs"}</h1>
                {!loading && !discipline ? <p>Sélectionne un pouvoir depuis sa discipline.</p> : null}

                {onToggleListPane ? (
                    <button
                        type="button"
                        className="listPaneCollapse"
                        onClick={onToggleListPane}
                        aria-label="Masquer la liste"
                        title="Masquer la liste"
                    >
                        <PanelLeftClose size={16} aria-hidden="true" />
                    </button>
                ) : null}
            </header>

            {loading ? (
                <LoadingState message="Chargement des pouvoirs..." />
            ) : (
                <div className="itemList">
                    {groups.map((group) => (
                        <div key={group.key} className="itemGroup">

                            <h2>{group.label}</h2>

                            {group.items.map((item) => (
                                <ItemListButton
                                    key={item.id}
                                    label={item.title}
                                    selected={item.id === activeItem?.id}
                                    onClick={() => navigate(`${activeNavigation.path}/${item.slug}`)}
                                />
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
