"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { PERMISOS_DISPONIBLES, formatPermiso } from "@/lib/permissions";
import type { Usuario } from "./UsuariosPanel";

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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    if (password || confirmPassword) {
      if (password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        setSaving(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        setSaving(false);
        return;
      }
    }

    try {
      const payload: Record<string, unknown> = { name, role, permissions, active };
      if (password) {
        payload.password = password;
      }

      const res = await fetch(`/api/admin/usuarios/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
            <p className="break-all font-body text-sm text-navy/80">{user.email}</p>
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

          <div className="rounded-xl border border-gold/20 bg-cream/40 p-4">
            <p className="section-label mb-3">Cambiar contraseña</p>
            <p className="mb-3 font-body text-xs text-navy/60">
              Dejá en blanco si no querés modificarla.
            </p>

            <div className="space-y-3">
              <div>
                <label
                  className="section-label mb-2 block"
                  htmlFor="edit-password"
                >
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    id="edit-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-navy/50 hover:text-gold"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="section-label mb-2 block"
                  htmlFor="edit-confirm-password"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="edit-confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Repetí la contraseña"
                  autoComplete="new-password"
                />
              </div>
            </div>
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
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full flex-1 disabled:opacity-70 sm:w-auto"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
