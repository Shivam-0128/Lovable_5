export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Last seven days including today, newest first, as YYYY-MM-DD. */
export function lastSevenDays(today: Date = new Date()): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    return toDateKey(d);
  });
}

/** Consecutive done days counting back from the most recent done day. */
export function currentStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  const latest = [...set].sort().at(-1)!;
  const [y, m, d] = latest.split("-").map(Number);
  let count = 0;
  let cursor = new Date(y, m - 1, d);
  while (set.has(toDateKey(cursor))) {
    count++;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }
  return count;
}
