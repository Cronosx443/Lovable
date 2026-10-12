export const CHANNEL = "event_timer_sync";
export type TimerMsg =
  | { type: "TICK" | "SYNC"; seconds: number }
  | { type: "REQUEST_SYNC" };

export function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
