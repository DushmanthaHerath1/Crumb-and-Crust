export const BAKERY_TIMEZONE = "Australia/Melbourne";

export const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export function formatOrderRef(id) {
  if (!id) return "—";
  return `#ORD-${id}`;
}

export function formatPickupTime(dateTimeStr) {
  if (!dateTimeStr) return "—";

  const isoStr =
    !dateTimeStr.endsWith("Z") && !dateTimeStr.includes("+")
      ? `${dateTimeStr}Z`
      : dateTimeStr;

  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-AU", {
    timeZone: BAKERY_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatPickupDateTime(dateTimeStr) {
  if (!dateTimeStr) return null;

  const isoStr =
    !dateTimeStr.endsWith("Z") && !dateTimeStr.includes("+")
      ? `${dateTimeStr}Z`
      : dateTimeStr;

  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return null;

  return date.toLocaleString("en-AU", {
    timeZone: BAKERY_TIMEZONE,
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
