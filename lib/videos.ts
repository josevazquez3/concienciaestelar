export function validateVideoTitle(title: string): boolean {
  return /^[A-Za-z0-9À-ÿ\u00C0-\u017F\s.,;:¿?¡!()'"-]{2,120}$/.test(
    title.trim()
  );
}

export function parseVideoDate(date: string): Date | null {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export const videoSelectFields = {
  id: true,
  youtubeId: true,
  url: true,
  title: true,
  date: true,
  enabled: true,
  createdAt: true,
} as const;
