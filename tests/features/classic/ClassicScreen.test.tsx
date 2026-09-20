/** Tap to type on the app board (spec 0016): board taps drive the session. */
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ClassicScreen } from "../../../src/features/classic/ClassicScreen";
import type { StringKey } from "../../../src/i18n/keys";

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

  it("lights the pre-posed i-matra key, then its consonant, for सि", () => {
    render(
      <ClassicScreen
        screen="home"
        level={2}
        layout="traditional"
        text={text}
        onDone={() => {}}
        onStats={() => {}}
      />,
    );
    const current = (name: string) =>
      screen.getByRole("button", { name }).getAttribute("aria-current");
    fireEvent.click(screen.getByRole("button", { name: "KeyA" }));
    expect(current("KeyL")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "KeyL" }));
    expect(current("Semicolon")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Semicolon" }));
    expect(screen.getByLabelText("typed").textContent).toContain("बसि");
  });

  it("shows the pre-posed i-matra at once while its base is awaited", () => {
    render(
      <ClassicScreen
        screen="home"
        level={3}
        layout="traditional"
        text={text}
        onDone={() => {}}
        onStats={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "KeyA" }));
    fireEvent.click(screen.getByRole("button", { name: "Semicolon" }));
    expect(screen.getByLabelText("typed").textContent).toBe("बस_");
    fireEvent.click(screen.getByRole("button", { name: "KeyL" }));
    const typed = screen.getByLabelText("typed");
    expect(typed.textContent).toBe("बसकि_");
    expect(typed.querySelector('[data-pending="true"]')?.textContent).toBe("कि");
    expect(screen.getByRole("button", { name: "KeyS" }).getAttribute("aria-current")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "KeyS" }));
    expect(screen.getByLabelText("typed").textContent).toContain("बसकि");
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
