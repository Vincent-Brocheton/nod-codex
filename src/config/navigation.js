import { COLLECTIONS } from "./collections.js";

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
                id: "recent-updates",
                type: "page",
                label: "Dernières mises à jour",
                path: "/mises-a-jour",
                icon: "book-open",
                hidden: true,
            },
            {
                id: "character-creation",
                type: "collection",
                label: "Créer son personnage",
                path: "/creation",
                icon: "user",

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

            {
                id: "atouts-lieux",
                type: "collection",
                label: "Atouts de Lieux",
                path: "/atouts-lieux",
                icon: "map-pin",

                view: "grouped-list",

                collections: [
                    COLLECTIONS.ATOUTS_LIEUX,
                ],
            },

            {
                id: "attributs",
                type: "collection",
                label: "Attributs",
                path: "/attributs",
                icon: "brain",

                view: "attributs",
                searchLabel: "attribut",

                collections: [
                    COLLECTIONS.ATTRIBUTS,
                ],
            },

            {
                id: "clans",
                type: "collection",
                label: "Clans",
                path: "/clans",
                icon: "shield-plus",

                view: "clans",
                detail: "clan",

                collections: [
                    COLLECTIONS.CLANS,
                ],
            },

            {
                id: "skills",
                type: "collection",
                label: "Compétences",
                path: "/competences",
                icon: "target",

                view: "competences",

                collections: [
                    COLLECTIONS.COMPETENCES,
                ],
            },

            {
                id: "disciplines",
                type: "collection",
                label: "Disciplines",
                path: "/disciplines",
                icon: "droplet",

                view: "disciplines",
                detail: "discipline",

                collections: [
                    COLLECTIONS.DISCIPLINES,
                    COLLECTIONS.POUVOIRS,
                    COLLECTIONS.POUVOIRS_ANCIENS,
                    COLLECTIONS.TECHNIQUES,
                ],
            },

            {
                id: "historiques",
                type: "collection",
                label: "Historiques",
                path: "/historiques",
                icon: "scroll",

                view: "historiques",
                searchLabel: "historique",

                collections: [
                    COLLECTIONS.HISTORIQUES,
                ],
            },

            {
                id: "lignees",
                type: "collection",
                label: "Lignées",
                path: "/lignees",
                icon: "shield-plus",

                view: "lignees",
                detail: "lignee",
                hidden: true,

                collections: [
                    COLLECTIONS.LIGNEES,
                ],
            },

            {
                id: "mysteres",
                type: "collection",
                label: "Mystères",
                path: "/mysteres",
                icon: "sparkles",

                view: "list",

                collections: [
                    COLLECTIONS.MYSTERES,
                ],
            },

            {
                id: "pouvoirs",
                type: "collection",
                label: "Pouvoirs",
                path: "/pouvoirs",
                icon: "droplet",

                view: "discipline-powers",
                detail: "power",
                hidden: true,

                collections: [
                    COLLECTIONS.POUVOIRS,
                    COLLECTIONS.POUVOIRS_ANCIENS,
                ],
            },

            {
                id: "rituals",
                type: "collection",
                label: "Rituels",
                path: "/rituels",
                icon: "pentagram",

                view: "rituals",

                collections: [
                    COLLECTIONS.THAUMATURGY,
                    COLLECTIONS.ABYSS,
                    COLLECTIONS.NECROMANCY,
                ],
            },

            {
                id: "techniques",
                type: "collection",
                label: "Techniques",
                path: "/techniques",
                icon: "swords",

                view: "techniques",
                detail: "technique",

                collections: [
                    COLLECTIONS.TECHNIQUES,
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

                collections: [
                    COLLECTIONS.REGLES,
                    COLLECTIONS.PERSONNAGE,
                ],
            },

            {
                id: "faq",
                type: "collection",
                label: "FAQ",
                path: "/faq",
                icon: "help-circle",

                view: "faq",

                collections: [
                    COLLECTIONS.FAQ,
                ],
            },
        ],
    },
];