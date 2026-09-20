/** Prompt paging domain tests (spec 0014 AC-2, AC-4). */
import { describe, expect, it } from "vitest";
import {
  PROMPT_PAGE_SIZE,
  chunkGroupsForPages,
  pageIndexForCursor,
  pageStartCursors,
  tokensForPrompt,
} from "../../src/domain/promptPaging";
import { CLASSIC_DRILLS } from "../../src/domain/classicDrills";
import { splitUnits } from "../../src/domain/preeti";

describe("tokensForPrompt", () => {
  it("splits on spaces and drops empties", () => {
    expect(tokensForPrompt("aaa  jjj ")).toEqual(["aaa", "jjj"]);
    expect(tokensForPrompt("")).toEqual([]);
  });
});

describe("chunkGroupsForPages", () => {
  it("holds 8 groups per page by default with a short last page", () => {
    expect(PROMPT_PAGE_SIZE).toBe(8);
    const tokens = Array.from({ length: 20 }, (_, i) => `g${String(i)}`);
    const pages = chunkGroupsForPages(tokens);
    expect(pages.map((p) => p.length)).toEqual([8, 8, 4]);
    expect(pages.flat().join(" ")).toBe(tokens.join(" "));
  });
  it("never splits a group like aaa", () => {
    const pages = chunkGroupsForPages(["aaa", "jjj", "aaa"], 2);
    expect(pages).toEqual([["aaa", "jjj"], ["aaa"]]);
  });
  it("reads empty or bad sizes as no pages", () => {
    expect(chunkGroupsForPages([])).toEqual([]);
    expect(chunkGroupsForPages(["aaa"], 0)).toEqual([]);
  });
});

describe("page cursors", () => {
  it("maps the cursor to the page holding it", () => {
    const pages = chunkGroupsForPages(["aaa", "jjj", "sss", "kkk"], 2);
    const starts = pageStartCursors(pages, (t) => t.length);
    expect(starts).toEqual([0, 8]);
    expect(pageIndexForCursor(starts, 0)).toBe(0);
    expect(pageIndexForCursor(starts, 7)).toBe(0);
    expect(pageIndexForCursor(starts, 8)).toBe(1);
    expect(pageIndexForCursor(starts, 99)).toBe(1);
    expect(pageIndexForCursor([], 0)).toBe(0);
  });
  it("keeps Traditional clusters whole across pages", () => {
    const pages = chunkGroupsForPages(tokensForPrompt("ममम पपप ममम"), 2);
    const starts = pageStartCursors(pages, (t) => splitUnits(t).length);
    expect(starts).toEqual([0, 8]);
    expect(splitUnits("ममम पपप ममम").length).toBe(11);
  });
  it("covers every bundled drill prompt end to end with no gaps", () => {
    for (const row of CLASSIC_DRILLS) {
      const tokens = tokensForPrompt(row.prompt);
      const pages = chunkGroupsForPages(tokens);
      const starts = pageStartCursors(pages, (t) => splitUnits(t).length);
      const full = splitUnits(row.prompt);
      expect(pages.flat().join(" ")).toBe(tokens.join(" "));
      const last = pages.length - 1;
      const lastLen =
        pages[last].reduce((n, t) => n + splitUnits(t).length, 0) + (pages[last].length - 1);
      expect(starts[last] + lastLen).toBe(full.length);
      expect(pageIndexForCursor(starts, full.length)).toBe(last);
    }
  });
});
