/** App shell: header nav plus main plus footer, all token driven. */
import type { ReactNode } from "react";
import type { StringKey } from "../i18n/keys";

export function LayoutShell({
  text,
  children,
}: {
  text: (key: StringKey) => string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-(--color-surface) text-(--color-ink)">
      <header className="flex items-center gap-6 px-6 py-4 border-b border-(--color-muted)">
        <span className="text-xl font-bold">Typeshala</span>
        <nav aria-label="Main" className="flex gap-4 text-base">
          <a href="#lessons">{text("nav.lessons")}</a>
          <a href="#progress">{text("nav.progress")}</a>
          <a href="#settings">{text("nav.settings")}</a>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
      <footer className="px-6 py-4 text-sm text-(--color-muted)">{text("app.tagline")}</footer>
    </div>
  );
}
