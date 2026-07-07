/* ── 별점 ──────────────────────────────────────────────── */
export function SearchRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5 text-xs font-semibold text-muted-foreground">
      <span className="text-jg-star">★</span>
      {value.toFixed(1)}
    </span>
  );
}
