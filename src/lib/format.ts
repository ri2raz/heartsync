/**
 * Date formatting for server-rendered pages. MannMitr serves India, so server output is
 * pinned to IST — otherwise a UTC server would print times 5½ hours off.
 * Client components show times in the viewer's own zone (see useMounted in components/chat).
 */
const TZ = "Asia/Kolkata";

export const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: TZ });
export const fmtDateLong = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", timeZone: TZ });
export const fmtMonthYear = (d: Date) => d.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: TZ });
export const fmtTime = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: TZ });
export const fmtDateTime = (d: Date) =>
  d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: TZ });
