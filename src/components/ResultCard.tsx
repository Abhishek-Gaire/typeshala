/** Simple result summary card on tokens. */
export function ResultCard({ wpm, accuracy }: { wpm: number; accuracy: number }) {
  return (
    <section aria-label="Result" className="rounded-2xl border border-(--color-muted) p-6">
      <p className="text-2xl font-bold">{wpm} WPM</p>
      <p className="text-lg text-(--color-muted)">{accuracy}% accuracy</p>
    </section>
  );
}
