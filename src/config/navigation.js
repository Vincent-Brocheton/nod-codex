import { COLLECTIONS } from "./collections.js";

// Ancienne catégorie Règles utilisée avant la base "Personnage" dédiée à
// l'assistant de création : gardée pour ne pas faire réapparaître d'anciens
// contenus non migrés dans la liste générale des Règles.
const CHARACTER_CREATION_CATEGORY = "Création de personnage";

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