export const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export function formatPickupDateTime(dateTimeStr) {
  if (!dateTimeStr) return null;

  const isoStr =
    !dateTimeStr.endsWith("Z") && !dateTimeStr.includes("+")
      ? `${dateTimeStr}Z`
      : dateTimeStr;
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleString("en-AU", {
    timeZone: "Australia/Sydney",
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
