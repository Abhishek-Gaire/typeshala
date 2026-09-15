/** Single settings screen on the existing Settings shape (spec 0009). */
import type { LayoutId, Theme, UiLanguage } from "../../domain/datastore";
import type { PromptSize } from "../../styles/tokens";
import type { StringKey } from "../../i18n/keys";
import { Button } from "../../components/Button";

export interface SettingsViewProps {
  theme: Theme;
  locale: UiLanguage;
  layout: LayoutId;
  sound: boolean;
  promptSize: PromptSize;
  text: (key: StringKey) => string;
  onTheme: (theme: Theme) => void;
  onLocale: (locale: UiLanguage) => void;
  onLayout: (layout: LayoutId) => void;
  onSound: (sound: boolean) => void;
  onPromptSize: (size: PromptSize) => void;
}

function Group(props: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-lg font-semibold">{props.label}</h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label={props.label}>
        {props.children}
      </div>
    </section>
  );
}

export function SettingsView(props: SettingsViewProps) {
  const { text } = props;
  return (
    <div>
      <Group label={text("settings.layout")}>
        <Button variant={props.layout === "qwerty" ? "primary" : "quiet"} onClick={() => props.onLayout("qwerty")}>
          {text("layout.english")}
        </Button>
        <Button variant={props.layout === "romanized" ? "primary" : "quiet"} onClick={() => props.onLayout("romanized")}>
          {text("layout.romanized")}
        </Button>
        <Button variant={props.layout === "traditional" ? "primary" : "quiet"} onClick={() => props.onLayout("traditional")}>
          {text("layout.traditional")}
        </Button>
      </Group>
      <Group label={text("settings.language")}>
        <Button variant={props.locale === "en" ? "primary" : "quiet"} onClick={() => props.onLocale("en")}>
          {text("lang.english")}
        </Button>
        <Button variant={props.locale === "ne" ? "primary" : "quiet"} onClick={() => props.onLocale("ne")}>
          {text("lang.nepali")}
        </Button>
      </Group>
      <Group label={text("settings.theme")}>
        <Button variant={props.theme === "light" ? "primary" : "quiet"} onClick={() => props.onTheme("light")}>
          {text("theme.light")}
        </Button>
        <Button variant={props.theme === "dark" ? "primary" : "quiet"} onClick={() => props.onTheme("dark")}>
          {text("theme.dark")}
        </Button>
        <Button variant={props.theme === "system" ? "primary" : "quiet"} onClick={() => props.onTheme("system")}>
          {text("theme.system")}
        </Button>
      </Group>
      <Group label={text("settings.sound")}>
        <Button variant={props.sound ? "primary" : "quiet"} onClick={() => props.onSound(true)}>
          {text("sound.on")}
        </Button>
        <Button variant={!props.sound ? "primary" : "quiet"} onClick={() => props.onSound(false)}>
          {text("sound.off")}
        </Button>
      </Group>
      <Group label={text("settings.promptSize")}>
        <Button variant={props.promptSize === "standard" ? "primary" : "quiet"} onClick={() => props.onPromptSize("standard")}>
          {text("size.standard")}
        </Button>
        <Button variant={props.promptSize === "large" ? "primary" : "quiet"} onClick={() => props.onPromptSize("large")}>
          {text("size.large")}
        </Button>
      </Group>
    </div>
  );
}
