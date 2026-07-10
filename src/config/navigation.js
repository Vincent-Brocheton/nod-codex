import { COLLECTIONS } from "./collections.js";

// Ancienne catégorie Règles utilisée avant la base "Personnage" dédiée à
// l'assistant de création : gardée pour ne pas faire réapparaître d'anciens
// contenus non migrés dans la liste générale des Règles.
const CHARACTER_CREATION_CATEGORY = "Création de Personnage";

export const navigation = [
    {
        id: "navigation",
        label: "Navigation",
        children: [
            {
                id: "home",
                type: "page",
                label: "Accueil",
                path: "/",
                icon: "home",
            },
            {
                id: "character-creation",
                type: "collection",
                label: "Créer son personnage",
                path: "/creation",
                icon: "user-plus",

                view: "wizard",

                collections: [
                    COLLECTIONS.PERSONNAGE,
                ],
            },
        ],
    },

    {
        id: "rules",
        label: "Règles",
        children: [
            {
                id: "clans",
                type: "collection",
                label: "Clans",
                path: "/clans",
                icon: "shield",

                view: "list",
                detail: "clan",

                collections: [
                    COLLECTIONS.CLANS,
                ],
            },

            {
                id: "disciplines",
                type: "collection",
                label: "Disciplines",
                path: "/disciplines",
                icon: "sparkles",

                view: "list",
                detail: "discipline",

                collections: [
                    COLLECTIONS.DISCIPLINES,
                    COLLECTIONS.POUVOIRS,
                    COLLECTIONS.POUVOIRS_ANCIENS,
                ],
            },

            {
                id: "lignees",
                type: "collection",
                label: "Lignées",
                path: "/lignees",
                icon: "shield",

                view: "lignees",
                detail: "lignee",
                hidden: true,

                collections: [
                    COLLECTIONS.LIGNEES,
                ],
            },

            {
                id: "pouvoirs",
                type: "collection",
                label: "Pouvoirs",
                path: "/pouvoirs",
                icon: "sparkles",

                view: "discipline-powers",
                detail: "power",
                hidden: true,

                collections: [
                    COLLECTIONS.POUVOIRS,
                    COLLECTIONS.POUVOIRS_ANCIENS,
                ],
            },

            {
                id: "techniques",
                type: "collection",
                label: "Techniques",
                path: "/techniques",
                icon: "swords",

                view: "list",
                detail: "technique",

                collections: [
                    COLLECTIONS.TECHNIQUES,
                ],
            },

            {
                id: "rituals",
                type: "collection",
                label: "Rituels",
                path: "/rituels",
                icon: "scroll",

                view: "rituals",

                collections: [
                    COLLECTIONS.THAUMATURGY,
                    COLLECTIONS.ABYSS,
                    COLLECTIONS.NECROMANCY,
                ],
            },

            {
                id: "skills",
                type: "collection",
                label: "Compétences",
                path: "/competences",
                icon: "brain",

                view: "list",

                collections: [
                    COLLECTIONS.COMPETENCES,
                ],
            },

            {
                id: "merits-flaws",
                type: "collection",
                label: "Atouts & Handicaps",
                path: "/atouts",
                icon: "star",

                view: "merits-flaws",

                collections: [
                    COLLECTIONS.MERITS,
                    COLLECTIONS.FLAWS,
                ],
            },
        ],
    },

    {
        id: "resources",
        label: "Ressources",
        children: [
            {
                id: "rules-overview",
                type: "collection",
                label: "Règles générales",
                path: "/regles",
                icon: "book-open",

                view: "grouped-list",
                groupFilter: { property: "Catégorie", exclude: [CHARACTER_CREATION_CATEGORY] },

                collections: [
                    COLLECTIONS.REGLES,
                ],
            },
        ],
    },
];