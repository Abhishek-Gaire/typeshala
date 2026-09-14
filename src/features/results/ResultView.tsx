/** Result view showing saved summary plus retry (spec 0004, AC-4). */
import type { Attempt } from "../../domain/datastore";
import type { StringKey } from "../../i18n/keys";
import { Button } from "../../components/Button";
import { ResultCard } from "../../components/ResultCard";

export function ResultView({
  attempt,
  lastNote,
  text,
  onAgain,
  onLessons,
}: {
  attempt: Attempt;
  lastNote: string | null;
  text: (key: StringKey) => string;
  onAgain: () => void;
  onLessons: () => void;
}) {
  return (
    <section aria-label="result">
      <h1 className="text-xl font-semibold text-(--color-ink)">{text("result.title")}</h1>
      <p className="mt-1 text-sm text-(--color-ink-soft)">{text("result.saved")}</p>
      <div className="mt-4">
        <ResultCard wpm={attempt.wpm} accuracy={attempt.accuracy} />
      </div>
      {lastNote !== null && (
        <p className="mt-3 text-sm text-(--color-ink-soft)" role="status">
          {lastNote}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <Button onClick={onAgain}>{text("result.again")}</Button>
        <Button variant="quiet" onClick={onLessons}>
          {text("result.lessons")}
        </Button>
      </div>
    </section>
  );
}
