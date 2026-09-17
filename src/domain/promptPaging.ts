/**
 * Single line prompt paging (spec 0014 AC-2, AC-4).
 * Pure code with no framework imports.
 * Pages hold whole drill groups (never split `aaa`), so the
 * teaching unit stays intact while the view shows one page at a time.
 */

/** Groups shown per page. Last page may hold fewer. */
export const PROMPT_PAGE_SIZE = 8;

/** Split a drill prompt into whole space separated groups. Empty tokens dropped. */
export function tokensForPrompt(prompt: string): string[] {
  return prompt.split(/\s+/).filter((t) => t.length > 0);
}

/** Chunk whole groups into pages. Empty input reads as no pages. */
export function chunkGroupsForPages(
  tokens: string[],
  perPage: number = PROMPT_PAGE_SIZE,
): string[][] {
  if (perPage <= 0) return [];
  const pages: string[][] = [];
  for (let at = 0; at < tokens.length; at += perPage) {
    pages.push(tokens.slice(at, at + perPage));
  }
  return pages;
}

/**
 * Cursor offset where each page starts, counted in prompt units.
 * unitLengthOf maps one group to its unit count (plain length for
 * English chars, splitUnits length for Traditional clusters).
 * Single spaces between groups count one unit each.
 */
export function pageStartCursors(
  pages: string[][],
  unitLengthOf: (token: string) => number,
): number[] {
  const starts: number[] = [];
  let at = 0;
  for (let p = 0; p < pages.length; p++) {
    const page = pages[p];
    starts.push(at);
    for (let i = 0; i < page.length; i++) {
      at += unitLengthOf(page[i]);
      const lastOverall = p === pages.length - 1 && i === page.length - 1;
      if (!lastOverall) at += 1;
    }
  }
  return starts;
}

/** Page holding the cursor. Clamped into range. Empty plan reads page 0. */
export function pageIndexForCursor(starts: number[], cursor: number): number {
  let index = 0;
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] <= cursor) index = i;
    else break;
  }
  return index;
}
