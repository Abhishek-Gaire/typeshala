/** Tap to type on the app board (spec 0016): board taps drive the session. */
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ClassicScreen } from "./ClassicScreen";
import type { StringKey } from "../../i18n/keys";

const text = (key: StringKey): string => key;

describe("ClassicScreen tap input", () => {
  it("types free text from board taps with no device keyboard path", () => {
    render(
      <ClassicScreen
        screen="free"
        level={1}
        layout="qwerty"
        text={text}
        onDone={() => {}}
        onStats={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "KeyH" }));
    fireEvent.click(screen.getByRole("button", { name: "KeyI" }));
    expect(screen.getByText("hi")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Backspace" }));
    expect(screen.getByText("h")).toBeDefined();
  });

  it("advances the drill on the expected tap and holds on a wrong tap", () => {
    render(
      <ClassicScreen
        screen="home"
        level={1}
        layout="qwerty"
        text={text}
        onDone={() => {}}
        onStats={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "KeyS" }));
    expect(screen.getByLabelText("typed").textContent).not.toContain("s");
    fireEvent.click(screen.getByRole("button", { name: "KeyA" }));
    expect(screen.getByLabelText("typed").textContent).toContain("a");
  });

  it("never summons the device keyboard from a touch on the practice box", () => {
    render(
      <ClassicScreen
        screen="free"
        level={1}
        layout="qwerty"
        text={text}
        onDone={() => {}}
        onStats={() => {}}
      />,
    );
    const box = screen.getByRole("textbox");
    // fireEvent returns false when the event was canceled.
    expect(fireEvent.pointerDown(box, { pointerType: "touch" })).toBe(false);
    expect(fireEvent.pointerDown(box, { pointerType: "mouse" })).toBe(true);
  });
});
