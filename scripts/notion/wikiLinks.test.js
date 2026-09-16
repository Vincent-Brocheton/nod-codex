import { describe, expect, it } from "vitest";
import { buildItemTargets, resolveWikiLinks } from "./wikiLinks.js";

const itemTargets = buildItemTargets(new Map([
    ["1", { title: "Brujah", collectionKey: "clans", slug: "brujah" }],
]));

describe("resolveWikiLinks", () => {
    it("returns null when the text has no [[ marker", () => {
        expect(resolveWikiLinks("Texte simple sans lien.")).toBeNull();
    });

    it("resolves a known fiche title to an item span", () => {
        const spans = resolveWikiLinks("Voir [[Brujah]] pour plus de détails.", itemTargets);

        expect(spans).toContainEqual({
            text: "Brujah",
            item: { collectionKey: "clans", slug: "brujah" },
        });
    });

    it("resolves a known navigation section (case-insensitive)", () => {
        const spans = resolveWikiLinks("Retour à l'[[accueil]].", itemTargets);

        expect(spans).toContainEqual({ text: "Accueil", path: "/" });
    });

    it("honors a custom label via [[cible|Libellé]]", () => {
        const spans = resolveWikiLinks("Voir [[Brujah|ce clan]].", itemTargets);

        expect(spans).toContainEqual({
            text: "ce clan",
            item: { collectionKey: "clans", slug: "brujah" },
        });
    });

    it("keeps an unresolved target as plain text instead of crashing", () => {
        const spans = resolveWikiLinks("Voir [[Brujah]] ou [[Clan Inexistant]].", itemTargets);

        expect(spans).toContainEqual({ text: "[[Clan Inexistant]]" });
    });

    it("returns null when every marker is unresolved (nothing actually linked)", () => {
        expect(resolveWikiLinks("[[Clan Inexistant]]", itemTargets)).toBeNull();
    });
});
