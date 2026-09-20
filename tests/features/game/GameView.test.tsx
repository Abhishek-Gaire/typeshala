/** Component tests for GameView (spec 0010). */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameView } from "../../../src/features/game/GameView";
import type { StringKey } from "../../../src/i18n/keys";

const text = (key: StringKey): string => key;
const prompts = ["asdf jkl", "ask lass fall"];

function renderGame(over: { prompts?: string[]; onQuit?: () => void } = {}) {
  return render(
    <GameView prompts={over.prompts ?? prompts} text={text} onQuit={over.onQuit ?? (() => {})} />,
  );
}

describe("GameView", () => {
  it("shows empty state with no word lists (covers AC-3 AC-5)", () => {
    renderGame({ prompts: ["a; b."] });
    expect(screen.getByRole("status")).toHaveTextContent("state.empty");
  });

  it("offers start then shows live score, lives, level (covers AC-1 AC-2)", async () => {
    const user = userEvent.setup();
    renderGame();
    await user.click(screen.getByRole("button", { name: "game.start" }));
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("game.score");
    expect(status).toHaveTextContent("game.lives");
    expect(status).toHaveTextContent("game.level");
  });

  it("pauses and resumes by button (covers AC-5)", async () => {
    const user = userEvent.setup();
    renderGame();
    await user.click(screen.getByRole("button", { name: "game.start" }));
    await user.click(screen.getByRole("button", { name: "game.pause" }));
    expect(screen.getByRole("button", { name: "game.resume" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "game.resume" }));
    expect(screen.getByRole("button", { name: "game.pause" })).toBeInTheDocument();
  });

  it("pauses on Escape (covers AC-5)", async () => {
    const user = userEvent.setup();
    renderGame();
    await user.click(screen.getByRole("button", { name: "game.start" }));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "game.resume" })).toBeInTheDocument();
  });

  it("quits back to the picker (covers AC-4 AC-5)", async () => {
    const user = userEvent.setup();
    const onQuit = vi.fn();
    renderGame({ onQuit });
    await user.click(screen.getByRole("button", { name: "game.start" }));
    await user.click(screen.getByRole("button", { name: "game.quit" }));
    expect(onQuit).toHaveBeenCalledOnce();
  });

  it("restarts the run from the controls (covers AC-4)", async () => {
    const user = userEvent.setup();
    renderGame();
    await user.click(screen.getByRole("button", { name: "game.start" }));
    await user.click(screen.getByRole("button", { name: "game.restart" }));
    expect(screen.getByRole("status")).toHaveTextContent("game.score: 0");
  });

  it("clears a falling word by typing it (covers AC-1)", async () => {
    const user = userEvent.setup();
    renderGame({ prompts: ["asdf"] });
    await user.click(screen.getByRole("button", { name: "game.start" }));
    const shown = screen.getByText("asdf", { exact: true });
    expect(shown).toBeInTheDocument();
    await user.keyboard("asdf");
    expect(screen.getByRole("status")).toHaveTextContent("game.score: 10");
  });

  it("every button has an accessible name and the start button takes focus (covers AC-5)", async () => {
    const user = userEvent.setup();
    renderGame();
    expect(screen.getByRole("button", { name: "game.start" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "game.start" }));
    for (const name of ["game.pause", "game.restart", "game.quit"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("ignores Space in the match buffer so buttons keep Space activation (covers AC-5)", async () => {
    const user = userEvent.setup();
    renderGame({ prompts: ["asdf"] });
    await user.click(screen.getByRole("button", { name: "game.start" }));
    await user.keyboard(" ");
    expect(screen.getByRole("status")).toHaveTextContent("game.score: 0");
    expect(screen.getByText("asdf", { exact: true })).toBeInTheDocument();
  });
});
