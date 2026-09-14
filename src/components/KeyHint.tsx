/** Small hint showing the next key to press. */
export function KeyHint({ nextKey }: { nextKey: string }) {
  return (
    <kbd className="inline-block rounded-lg border border-(--color-muted) px-4 py-2 text-xl font-mono">
      {nextKey}
    </kbd>
  );
}
