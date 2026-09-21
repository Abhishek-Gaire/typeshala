/** Tap input on the app board (spec 0016): keys report taps, display stays span only. */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ClassicKeyboard } from "../../src/components/ClassicKeyboard";

describe("ClassicKeyboard tap input", () => {
  it("reports char, space, and Backspace taps with physical key detail", () => {
    const onTapKey = vi.fn();
    render(<ClassicKeyboard layout="qwerty" next="a" onTapKey={onTapKey} />);
    fireEvent.click(screen.getByRole("button", { name: "KeyA" }));
    fireEvent.click(screen.getByRole("button", { name: "Space" }));
    fireEvent.click(screen.getByRole("button", { name: "Backspace" }));
    expect(onTapKey).toHaveBeenCalledTimes(3);
    expect(onTapKey.mock.calls[0][0]).toMatchObject({ code: "KeyA", base: "a" });
    expect(onTapKey.mock.calls[1][0]).toMatchObject({ code: "Space" });
    expect(onTapKey.mock.calls[2][0]).toMatchObject({ code: "Backspace" });
  });

  it("keeps tap buttons out of the tab order", () => {
    const onTapKey = vi.fn();
    render(<ClassicKeyboard layout="qwerty" next="a" onTapKey={onTapKey} />);
    expect(screen.getByRole("button", { name: "KeyA" }).getAttribute("tabindex")).toBe("-1");
  });

  it("renders display only spans with no tap handler", () => {
    render(<ClassicKeyboard layout="qwerty" next="a" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("lights an explicit key for multi-key units", () => {
    render(
      <ClassicKeyboard layout="traditional" next="सि" litCode="Semicolon" onTapKey={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "Semicolon" }).getAttribute("aria-current")).toBe(
      "true",
    );
    expect(screen.getByRole("button", { name: "KeyL" }).getAttribute("aria-current")).toBeNull();
  });

  it("lights opposite hand Shift with a Shift key", () => {
    const { container } = render(
      <ClassicKeyboard
        layout="traditional"
        next="म्"
        litCode="KeyD"
        shiftCode="ShiftRight"
        onTapKey={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "KeyD" }).getAttribute("aria-current")).toBe("true");
    expect(container.querySelectorAll('[aria-current="true"]')).toHaveLength(2);
  });

  it("keeps one lit key when Shift is not needed", () => {
    const { container } = render(
      <ClassicKeyboard layout="qwerty" next="a" onTapKey={() => {}} />,
    );
    expect(container.querySelectorAll('[aria-current="true"]')).toHaveLength(1);
  });
});
