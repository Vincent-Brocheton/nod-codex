import { COLLECTIONS } from "./collections";

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
                type: "page",
                label: "Créer son personnage",
                path: "/creation",
                icon: "user-plus",
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

                view: "list",
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
                type: "page",
                label: "Règles générales",
                path: "/regles",
                icon: "book-open",
            },
        ],
    },
];