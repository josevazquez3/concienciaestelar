"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Usuario } from "./UsuariosPanel";

const PERMISOS_DISPONIBLES = [
  "ver_contenido",
  "descargar_materiales",
  "acceso_biblioteca",
  "gestionar_usuarios",
];

interface UserEditModalProps {
  user: Usuario;
  onClose: () => void;
  onSaved: (user: Usuario) => void;
}

export function UserEditModal({ user, onClose, onSaved }: UserEditModalProps) {
  const [name, setName] = useState(user.name ?? "");
  const [role, setRole] = useState<"ADMIN" | "CLIENTE">(user.role);
  const [permissions, setPermissions] = useState<string[]>(user.permissions);
  const [active, setActive] = useState(user.active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function togglePermission(perm: string) {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/usuarios/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, permissions, active }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al guardar");
      }
      const updated = await res.json();
      onSaved({ ...user, ...updated });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy/50"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="relative z-10 w-full max-w-lg rounded-card border border-gold/30 bg-warm-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-navy">
            Editar usuario
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
            <p className="section-label mb-1">Email</p>
            <p className="font-body text-sm text-navy/80">{user.email}</p>
          </div>

          <div>
            <label className="section-label mb-2 block" htmlFor="edit-name">
              Nombre
            </label>
            <input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="section-label mb-2 block" htmlFor="edit-role">
              Rol
            </label>
            <select
              id="edit-role"
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
                  {perm.replace(/_/g, " ")}
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

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline flex-1"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1 disabled:opacity-70"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
