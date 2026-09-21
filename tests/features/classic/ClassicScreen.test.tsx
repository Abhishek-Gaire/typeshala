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

describe("ClassicScreen All review rows (spec 0019)", () => {
  it("shows the cross row All L1 prompt in English and lights its first key (covers AC-1, AC-5)", () => {
    render(
      <ClassicScreen
        screen="all"
        level={1}
        layout="qwerty"
        text={text}
        onDone={() => {}}
        onStats={() => {}}
      />,
    );
    expect(screen.getByRole("textbox").getAttribute("aria-label")).toBe("All L1");
    expect(screen.getByLabelText("reference").textContent).toContain("qqq");
    expect(screen.getByRole("button", { name: "KeyQ" }).getAttribute("aria-current")).toBe("true");
  });

  it("shows the cross row All L2 prompt in Traditional (covers AC-4, AC-5)", () => {
    render(
      <ClassicScreen
        screen="all"
        level={2}
        layout="traditional"
        text={text}
        onDone={() => {}}
        onStats={() => {}}
      />,
    );
    expect(screen.getByRole("textbox").getAttribute("aria-label")).toBe("All L2");
    expect(screen.getByLabelText("reference").textContent).toContain("बसित्र");
  });

  it("lights the opposite hand Shift with a capital prompt head", () => {
    const { container } = render(
      <ClassicScreen
        screen="all"
        level={3}
        layout="qwerty"
        text={text}
        onDone={() => {}}
        onStats={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "KeyT" }).getAttribute("aria-current")).toBe("true");
    expect(container.querySelectorAll('[aria-current="true"]')).toHaveLength(2);
  });
});
