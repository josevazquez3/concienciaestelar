"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PERMISOS_DISPONIBLES, formatPermiso } from "@/lib/permissions";
import type { Usuario } from "./UsuariosPanel";

interface UserCreateModalProps {
  onClose: () => void;
  onCreated: (user: Usuario) => void;
}

export function UserCreateModal({ onClose, onCreated }: UserCreateModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "CLIENTE">("CLIENTE");
  const [permissions, setPermissions] = useState<string[]>([
    "ver_contenido",
  ]);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function togglePermission(perm: string) {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  async function handleCreate() {
    setSaving(true);
    setError("");

    if (!email.trim() || !password) {
      setError("Email y contraseña son obligatorios.");
      setSaving(false);
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          email: email.trim().toLowerCase(),
          password,
          role,
          permissions,
          active,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Error al crear usuario");
      }

      onCreated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy/50"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-card border border-gold/30 bg-warm-white p-4 shadow-2xl sm:max-h-[90vh] sm:rounded-card sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-navy sm:text-xl">
            Crear usuario
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-navy/50 hover:text-navy"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="section-label mb-2 block" htmlFor="create-name">
              Nombre
            </label>
            <input
              id="create-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="section-label mb-2 block" htmlFor="create-email">
              Email
            </label>
            <input
              id="create-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="usuario@email.com"
            />
          </div>

          <div>
            <label
              className="section-label mb-2 block"
              htmlFor="create-password"
            >
              Contraseña
            </label>
            <input
              id="create-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label className="section-label mb-2 block" htmlFor="create-role">
              Rol
            </label>
            <select
              id="create-role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "ADMIN" | "CLIENTE")
              }
              className="input-field"
            >
              <option value="CLIENTE">CLIENTE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div>
            <p className="section-label mb-2">Permisos</p>
            <div className="space-y-2">
              {PERMISOS_DISPONIBLES.map((perm) => (
                <label
                  key={perm}
                  className="flex cursor-pointer items-center gap-2 font-body text-sm text-navy/80"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="accent-gold"
                  />
                  {formatPermiso(perm)}
                </label>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 font-body text-sm text-navy">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-gold"
            />
            Usuario activo
          </label>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline w-full flex-1 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="btn-primary w-full flex-1 disabled:opacity-70 sm:w-auto"
          >
            {saving ? "Creando..." : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}
