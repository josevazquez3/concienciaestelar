export const ARG_TIMEZONE = "America/Argentina/Buenos_Aires";

export function formatDateArgentina(
  value: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  return date.toLocaleDateString("es-AR", {
    timeZone: ARG_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  });
}

export function formatDateTimeArgentina(value: Date | string | null | undefined): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  const datePart = date.toLocaleDateString("es-AR", {
    timeZone: ARG_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString("es-AR", {
    timeZone: ARG_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${datePart} ${timePart}`;
}
