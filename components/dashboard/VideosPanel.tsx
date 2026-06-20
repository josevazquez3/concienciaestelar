"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Trash2,
  Video,
} from "lucide-react";
import { formatDateArgentina } from "@/lib/date-format";
import { youtubeThumbnailUrl } from "@/lib/youtube";
import { toDateInputValue } from "@/lib/videos";

type VideoItem = {
  id: string;
  youtubeId: string;
  url: string;
  title: string;
  date: string;
  enabled: boolean;
};

function formatDateShort(iso: string): string {
  return formatDateArgentina(iso) || iso;
}

function matchesVideoSearch(item: VideoItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  if (item.title.toLowerCase().includes(q)) return true;

  const d = new Date(item.date);
  if (Number.isNaN(d.getTime())) return false;

  const dateVariants = [
    formatDateShort(item.date),
    item.date.slice(0, 10),
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`,
    String(d.getFullYear()),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ];

  return dateVariants.some((variant) => variant.toLowerCase().includes(q));
}

function VideoCard({
  item,
  isAdmin,
  onEdit,
  onDelete,
  onToggleEnabled,
  toggling,
}: {
  item: VideoItem;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleEnabled: () => void;
  toggling: boolean;
}) {
  const thumb = useMemo(() => youtubeThumbnailUrl(item.youtubeId), [item.youtubeId]);

  return (
    <article
      className={`card-glass overflow-hidden ${!item.enabled ? "opacity-75 ring-1 ring-navy/10" : ""}`}
    >
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
            className={`object-cover transition-transform duration-300 group-hover:scale-[1.02] ${!item.enabled ? "grayscale" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/35 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-warm-white/90 px-3 py-1 font-ui text-[11px] uppercase tracking-wider text-navy shadow-sm">
            <Video size={14} />
            YouTube
          </div>
          {isAdmin && !item.enabled && (
            <div className="absolute right-3 top-3 rounded-full bg-navy/80 px-3 py-1 font-ui text-[10px] uppercase tracking-wider text-white">
              Oculto
            </div>
          )}
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

        {isAdmin && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gold/15 pt-4">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 font-ui text-[11px] uppercase tracking-wider text-navy transition-colors hover:bg-gold/10"
            >
              <Pencil size={14} />
              Editar
            </button>
            <button
              type="button"
              onClick={onToggleEnabled}
              disabled={toggling}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-ui text-[11px] uppercase tracking-wider transition-colors disabled:opacity-60 ${
                item.enabled
                  ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              {item.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
              {item.enabled ? "Habilitado" : "Deshabilitado"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 font-ui text-[11px] uppercase tracking-wider text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function VideoFormModal({
  open,
  title,
  subtitle,
  submitLabel,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  submitLabel: string;
  initial?: { url?: string; title: string; date: string };
  onClose: () => void;
  onSubmit: (data: { url?: string; title: string; date: string }) => Promise<void>;
}) {
  const [url, setUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setUrl(initial?.url ?? "");
    setVideoTitle(initial?.title ?? "");
    setDate(initial?.date ? toDateInputValue(initial.date) : "");
    setError("");
  }, [open, initial]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await onSubmit({ url, title: videoTitle, date });
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
        <div className="mb-5">
          <h2 className="font-display text-lg font-semibold text-navy sm:text-xl">
            {title}
          </h2>
          <p className="mt-1 font-body text-sm text-navy/60">{subtitle}</p>
        </div>

        <div className="space-y-4">
          {initial?.url === undefined && (
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
          )}

          <div>
            <label className="section-label mb-2 block" htmlFor="video-title">
              Título
            </label>
            <input
              id="video-title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
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
            {saving ? "Guardando..." : submitLabel}
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
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<VideoItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(
    () => items.filter((item) => matchesVideoSearch(item, searchQuery)),
    [items, searchQuery]
  );

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

  async function handleCreate(data: { url?: string; title: string; date: string }) {
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Error al guardar");
    setItems((prev) => [json, ...prev]);
  }

  async function handleEdit(data: { title: string; date: string }) {
    if (!editing) return;
    const res = await fetch(`/api/videos/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Error al guardar");
    setItems((prev) => prev.map((v) => (v.id === json.id ? json : v)));
    setEditing(null);
  }

  async function handleToggleEnabled(item: VideoItem) {
    setTogglingId(item.id);
    try {
      const res = await fetch(`/api/videos/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !item.enabled }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al actualizar");
      setItems((prev) => prev.map((v) => (v.id === json.id ? json : v)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo actualizar");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(item: VideoItem) {
    if (!confirm(`¿Eliminar el video "${item.title}"?`)) return;
    const res = await fetch(`/api/videos/${item.id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error ?? "No se pudo eliminar");
      return;
    }
    setItems((prev) => prev.filter((v) => v.id !== item.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy/40"
            size={18}
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
            placeholder="Buscar por título o fecha..."
            aria-label="Buscar videos por título o fecha"
          />
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="btn-primary w-full shrink-0 text-xs sm:w-auto"
          >
            <Plus size={16} />
            Agregar video
          </button>
        )}
      </div>

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

      {!loading && !error && items.length > 0 && filteredItems.length === 0 && (
        <div className="card-glass p-6 text-center sm:p-8">
          <p className="font-body text-navy/70">
            No hay videos que coincidan con{" "}
            <span className="font-semibold text-navy">&ldquo;{searchQuery}&rdquo;</span>
          </p>
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <VideoCard
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              toggling={togglingId === item.id}
              onEdit={() => setEditing(item)}
              onDelete={() => handleDelete(item)}
              onToggleEnabled={() => handleToggleEnabled(item)}
            />
          ))}
        </div>
      )}

      <VideoFormModal
        open={addOpen}
        title="Agregar video"
        subtitle="Pegá una URL de YouTube y completá los datos."
        submitLabel="Guardar video"
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
      />

      <VideoFormModal
        open={!!editing}
        title="Editar video"
        subtitle="Modificá el título o la fecha del video."
        submitLabel="Guardar cambios"
        initial={editing ?? undefined}
        onClose={() => setEditing(null)}
        onSubmit={handleEdit}
      />
    </div>
  );
}
