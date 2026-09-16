import { describe, expect, it } from "vitest";
import { validateUniqueSlugs } from "./sync-notion.js";

describe("validateUniqueSlugs", () => {
    it("accepts a collection with unique slugs", () => {
        expect(() =>
            validateUniqueSlugs(
                [
                    { id: "1", title: "Brujah", slug: "brujah" },
                    { id: "2", title: "Ventrue", slug: "ventrue" },
                ],
                "Clans"
            )
        ).not.toThrow();
    });

    it("throws when two fiches share the same slug", () => {
        expect(() =>
            validateUniqueSlugs(
                [
                    { id: "1", title: "Brujah", slug: "brujah" },
                    { id: "2", title: "Brujah (doublon)", slug: "brujah" },
                ],
                "Clans"
            )
        ).toThrow(/Slug dupliqué/);
    });

    it("throws when a fiche has an empty slug", () => {
        expect(() =>
            validateUniqueSlugs([{ id: "1", title: "Sans titre", slug: "" }], "Clans")
        ).toThrow(/slug vide/);
    });
});
