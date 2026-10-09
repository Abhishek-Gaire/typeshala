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

  it("guides a romanized drill by roman key and types it by tap (spec 0022 AC-3)", () => {
    render(
      <ClassicScreen
        screen="home"
        level={1}
        layout="romanized"
        text={text}
        onDone={() => {}}
        onStats={() => {}}
      />,
    );
    const current = (name: string) =>
      screen.getByRole("button", { name }).getAttribute("aria-current");
    // Home L1 romanized opens on a home key char, so the lit key is the
    // first roman letter of its sequence.
    expect(current("KeyA")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "KeyA" }));
    fireEvent.click(screen.getByRole("button", { name: "KeyA" }));
    fireEvent.click(screen.getByRole("button", { name: "KeyA" }));
    expect(screen.getByLabelText("typed").textContent).toContain("अअअ");
    expect(current("Space")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Space" }));
    expect(current("KeyH")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "KeyH" }));
    expect(current("KeyA")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "KeyA" }));
    expect(screen.getByLabelText("typed").textContent).toContain("ह");
  });

  it("clears the pending roman buffer before a char on backspace (spec 0022 AC-4)", () => {
    render(
      <ClassicScreen
        screen="home"
        level={1}
        layout="romanized"
        text={text}
        onDone={() => {}}
        onStats={() => {}}
      />,
    );
    const box = screen.getByRole("textbox");
    box.focus();
    fireEvent.keyDown(box, { key: "a", code: "KeyA" });
    fireEvent.keyDown(box, { key: "Backspace", code: "Backspace" });
    fireEvent.keyDown(box, { key: "a", code: "KeyA" });
    fireEvent.keyDown(box, { key: "a", code: "KeyA" });
    fireEvent.keyDown(box, { key: "a", code: "KeyA" });
    expect(screen.getByLabelText("typed").textContent).toContain("अअअ");
  });

  it("prints the spaced roman finger hint for a multi key unit (spec 0022 AC-3)", () => {
    render(
      <ClassicScreen
        screen="home"
        level={1}
        layout="romanized"
        text={text}
        onDone={() => {}}
        onStats={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "KeyA" }));
    fireEvent.click(screen.getByRole("button", { name: "KeyA" }));
    fireEvent.click(screen.getByRole("button", { name: "KeyA" }));
    fireEvent.click(screen.getByRole("button", { name: "Space" }));
    expect(screen.getByText("h a")).toBeDefined();
  });

  it("marks the wrong roman key, first as a pressed miss then as a held mark (spec 0022 AC-4)", () => {
    render(
      <ClassicScreen
        screen="home"
        level={1}
        layout="romanized"
        text={text}
        onDone={() => {}}
        onStats={() => {}}
      />,
    );
    const box = screen.getByRole("textbox");
    box.focus();
    fireEvent.keyDown(box, { key: "a", code: "KeyA" });
    fireEvent.keyDown(box, { key: "x", code: "KeyX" });
    expect(screen.getByRole("button", { name: "KeyX" }).className).toContain("f97316");
    // The next key moves the press flash, and a held pending key keeps the
    // wrong key marked until the sequence resolves.
    fireEvent.keyDown(box, { key: "k", code: "KeyK" });
    expect(screen.getByRole("button", { name: "KeyX" }).className).toContain("ffcccc");
  });

  it("saves a finished romanized drill with layout romanized (spec 0022 AC-4)", () => {
    const done: Array<{ layout: string; lessonId: string }> = [];
    render(
      <ClassicScreen
        screen="all"
        level={3}
        layout="romanized"
        text={text}
        onDone={(attempt) => {
          done.push({ layout: attempt.layout, lessonId: attempt.lessonId });
        }}
        onStats={() => {}}
      />,
    );
    const box = screen.getByRole("textbox");
    box.focus();
    // नमन मगन कमल नयन पवन सरल, key by key.
    const keys = [
      "n",
      "a",
      "m",
      "a",
      "n",
      "a",
      " ",
      "m",
      "a",
      "g",
      "a",
      "n",
      "a",
      " ",
      "k",
      "a",
      "m",
      "a",
      "l",
      "a",
      " ",
      "n",
      "a",
      "y",
      "a",
      "n",
      "a",
      " ",
      "p",
      "a",
      "v",
      "a",
      "n",
      "a",
      " ",
      "s",
      "a",
      "r",
      "a",
      "l",
      "a",
    ];
    for (const key of keys) {
      fireEvent.keyDown(box, { key });
    }
    expect(done).toHaveLength(1);
    expect(done[0]).toEqual({ layout: "romanized", lessonId: "cl-all-3-rn" });
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
