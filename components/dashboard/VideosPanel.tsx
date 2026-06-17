"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink, Plus, Video } from "lucide-react";
import { youtubeThumbnailUrl } from "@/lib/youtube";

type VideoItem = {
  id: string;
  youtubeId: string;
  url: string;
  title: string;
  date: string;
};

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function VideoCard({ item }: { item: VideoItem }) {
  const thumb = useMemo(() => youtubeThumbnailUrl(item.youtubeId), [item.youtubeId]);

  return (
    <article className="card-glass overflow-hidden">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
        aria-label={`Abrir video: ${item.title}`}
      >
        <div className="relative aspect-video w-full bg-navy/5">
          <Image
            src={thumb}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/35 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-warm-white/90 px-3 py-1 font-ui text-[11px] uppercase tracking-wider text-navy shadow-sm">
            <Video size={14} />
            YouTube
          </div>
        </div>
      </a>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="break-words font-display text-base font-semibold text-navy">
              {item.title}
            </h3>
            <p className="mt-1 font-body text-sm text-navy/60">
              {formatDateShort(item.date)}
            </p>
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full border border-gold/30 p-2 text-gold transition-colors hover:bg-gold/10"
            aria-label="Abrir en una pestaña nueva"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </article>
  );
}

function AddVideoModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (item: VideoItem) => void;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
  }, [open]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title, date }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");

      onCreated(data);
      setUrl("");
      setTitle("");
      setDate("");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy/50"
        onClick={onClose}
        aria-label="Cerrar"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-card border border-gold/30 bg-warm-white p-4 shadow-2xl sm:max-h-[90vh] sm:rounded-card sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-navy sm:text-xl">
              Agregar video
            </h2>
            <p className="mt-1 font-body text-sm text-navy/60">
              Pegá una URL de YouTube y completá los datos.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="section-label mb-2 block" htmlFor="video-url">
              URL (YouTube)
            </label>
            <input
              id="video-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-field"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="section-label mb-2 block" htmlFor="video-title">
              Título
            </label>
            <input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Ej: Encuentro Luna Llena — Junio"
            />
          </div>

          <div>
            <label className="section-label mb-2 block" htmlFor="video-date">
              Fecha
            </label>
            <input
              id="video-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button type="button" onClick={onClose} className="btn-outline w-full flex-1 sm:w-auto">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full flex-1 disabled:opacity-70 sm:w-auto"
          >
            {saving ? "Guardando..." : "Guardar video"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function VideosPanel({ isAdmin }: { isAdmin: boolean }) {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar");
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button type="button" onClick={() => setOpen(true)} className="btn-primary w-full text-xs sm:w-auto">
            <Plus size={16} />
            Agregar video
          </button>
        </div>
      )}

      {loading && <p className="font-body text-navy/60">Cargando videos...</p>}

      {!loading && error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="card-glass p-6 text-center sm:p-8">
          <p className="font-body italic text-navy/60">
            Todavía no hay videos cargados.
          </p>
          {isAdmin && (
            <p className="mt-2 font-body text-sm text-navy/60">
              Usá <span className="font-semibold text-navy">Agregar video</span> para comenzar.
            </p>
          )}
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <AddVideoModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(created) => setItems((prev) => [created, ...prev])}
      />
    </div>
  );
}

