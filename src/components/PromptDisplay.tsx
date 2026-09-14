/** Large readable prompt line. Size comes from saved prompt size. */
import { promptFontSize, type PromptSize } from "../styles/tokens";

export function PromptDisplay({ text, size }: { text: string; size: PromptSize }) {
  return (
    <p
      className="leading-relaxed font-medium text-(--color-ink)"
      style={{ fontSize: promptFontSize(size) }}
    >
      {text}
    </p>
  );
}
