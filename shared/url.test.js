import { describe, expect, it } from "vitest";
import slugify from "./url.js";

describe("slugify", () => {
    it("lowercases and replaces spaces with dashes", () => {
        expect(slugify("Clan Brujah")).toBe("clan-brujah");
    });

    it("strips accents", () => {
        expect(slugify("Créer son personnage")).toBe("creer-son-personnage");
    });

    it("strips punctuation and collapses repeated separators", () => {
        expect(slugify("Atouts & Handicaps : Clan")).toBe("atouts-handicaps-clan");
    });

    it("trims leading and trailing dashes", () => {
        expect(slugify("  -Ventrue-  ")).toBe("ventrue");
    });
});
