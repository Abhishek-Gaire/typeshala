/** App shell: full bleed main. Classic chrome owns its own menus. */
import type { ReactNode } from "react";

export function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-[800px] flex-col overflow-x-auto bg-white text-black">
      <main className="flex min-w-[800px] flex-1 flex-col">{children}</main>
    </div>
  );
}
