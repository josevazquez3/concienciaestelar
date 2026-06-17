export function extractYouTubeId(inputUrl: string): string | null {
  const raw = inputUrl.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);

    // youtu.be/<id>
    if (url.hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return isValidYouTubeId(id) ? id : null;
    }

    const host = url.hostname.replace(/^www\./, "");
    if (host !== "youtube.com" && host !== "m.youtube.com") return null;

    // youtube.com/watch?v=<id>
    const v = url.searchParams.get("v");
    if (v && isValidYouTubeId(v)) return v;

    // youtube.com/shorts/<id> or /embed/<id>
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "shorts" || p === "embed");
    if (idx !== -1) {
      const id = parts[idx + 1];
      return isValidYouTubeId(id) ? id : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function youtubeThumbnailUrl(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

function isValidYouTubeId(id: string | undefined | null): id is string {
  if (!id) return false;
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

