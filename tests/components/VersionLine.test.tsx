/** VersionLine state tests (spec 0023 AC-6, AC-7). */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { VersionLine } from "../../src/components/VersionLine";
import type { StringKey } from "../../src/i18n/keys";

const text = (key: StringKey): string => key;

describe("VersionLine", () => {
  it("renders nothing while pending, so no fallback flashes (AC-7)", () => {
    const { container } = render(<VersionLine version={null} versionState="pending" text={text} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the version when ready (AC-2)", () => {
    render(<VersionLine version="1.0.2" versionState="ready" text={text} />);
    expect(screen.getByText(/1\.0\.2/)).toBeInTheDocument();
  });

  it("renders the fallback when failed (AC-6)", () => {
    render(<VersionLine version={null} versionState="failed" text={text} />);
    expect(screen.getByText(/about.versionUnavailable/)).toBeInTheDocument();
  });

  it("falls back if state says ready but no version arrived", () => {
    render(<VersionLine version={null} versionState="ready" text={text} />);
    expect(screen.getByText(/about.versionUnavailable/)).toBeInTheDocument();
  });

  it("lets the caller own the text color (spec 0023, Win95 dialog contrast)", () => {
    const { rerender } = render(<VersionLine version="1.0.1" versionState="ready" text={text} />);
    // Default is the project's own muted token, per design.md "tokens only".
    expect(screen.getByText(/1\.0\.1/).className).toContain("text-(--color-muted)");
    rerender(
      <VersionLine version="1.0.1" versionState="ready" text={text} className="text-black" />,
    );
    // The About dialog's fixed gray panel needs black, not the themed default.
    expect(screen.getByText(/1\.0\.1/).className).toContain("text-black");
    expect(screen.getByText(/1\.0\.1/).className).not.toContain("color-muted");
  });
});
