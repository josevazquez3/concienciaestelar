"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { UserEditModal } from "./UserEditModal";
import { UserCreateModal } from "./UserCreateModal";

export type Usuario = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "CLIENTE";
  permissions: string[];
  active: boolean;
  createdAt: string;
};

function ActiveToggleButton({
  user,
  onToggle,
  disabled,
}: {
  user: Usuario;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`rounded-lg p-2 transition-colors disabled:opacity-60 ${
        user.active
          ? "bg-green-50 text-green-700 hover:bg-green-100"
          : "bg-red-50 text-red-600 hover:bg-red-100"
      }`}
      aria-label={user.active ? "Desactivar usuario" : "Activar usuario"}
      title={user.active ? "Usuario activo — clic para desactivar" : "Usuario inactivo — clic para activar"}
    >
      {user.active ? <UserCheck size={16} /> : <UserX size={16} />}
    </button>
  );
}

function UserCard({
  user,
  onEdit,
  onDelete,
  onToggleActive,
  toggling,
}: {
  user: Usuario;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  toggling: boolean;
}) {
  return (
    <article className="rounded-card border border-gold/20 bg-white/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-body font-medium text-navy">
            {user.name ?? "Sin nombre"}
          </p>
          <p className="break-all font-body text-sm text-navy/70">{user.email}</p>
        </div>
        <span className="shrink-0 rounded-full bg-gold/10 px-2 py-0.5 font-ui text-xs text-gold">
          {user.role}
        </span>
      </div>

      <div className="mb-4 flex items-center justify-between gap-2">
        <span
          className={
            user.active
              ? "font-body text-sm text-green-700"
              : "font-body text-sm text-red-600"
          }
        >
          {user.active ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="btn-outline flex-1 text-xs"
        >
          <Pencil size={14} />
          Editar
        </button>
        <ActiveToggleButton
          user={user}
          onToggle={onToggleActive}
          disabled={toggling}
        />
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full border border-red-200 px-4 py-2.5 font-ui text-xs uppercase tracking-wider text-red-600 transition-colors hover:bg-red-50"
          aria-label="Eliminar usuario"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}

export function UsuariosPanel() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/usuarios");
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este usuario?")) return;
    const res = await fetch(`/api/admin/usuarios/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  }

  async function handleToggleActive(user: Usuario) {
    setTogglingId(user.id);
    try {
      const res = await fetch(`/api/admin/usuarios/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al actualizar");
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...data } : u))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo actualizar el estado");
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) {
    return <p className="font-body text-navy/60">Cargando usuarios...</p>;
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
        {error}
      </p>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="btn-primary w-full text-xs sm:w-auto"
        >
          <Plus size={16} />
          Crear usuario
        </button>
      </div>

      <div className="grid gap-4 md:hidden">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            toggling={togglingId === user.id}
            onEdit={() => setEditing(user)}
            onDelete={() => handleDelete(user.id)}
            onToggleActive={() => handleToggleActive(user)}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-card border border-gold/20 bg-white/60 md:block">
        <table className="w-full min-w-[640px] text-left font-body text-sm">
          <thead>
            <tr className="border-b border-gold/20 bg-cream/50">
              <th className="px-4 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                Nombre
              </th>
              <th className="px-4 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                Email
              </th>
              <th className="px-4 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                Rol
              </th>
              <th className="px-4 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                Estado
              </th>
              <th className="px-4 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gold/10 last:border-0">
                <td className="px-4 py-3 text-navy">{user.name ?? "—"}</td>
                <td className="max-w-[200px] break-all px-4 py-3 text-navy/80">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gold/10 px-2 py-0.5 font-ui text-xs text-gold">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      user.active ? "text-green-700" : "text-red-600"
                    }
                  >
                    {user.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(user)}
                      className="rounded-lg p-2 text-navy/60 transition-colors hover:bg-gold/10 hover:text-gold"
                      aria-label="Editar usuario"
                    >
                      <Pencil size={16} />
                    </button>
                    <ActiveToggleButton
                      user={user}
                      onToggle={() => handleToggleActive(user)}
                      disabled={togglingId === user.id}
                    />
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      className="rounded-lg p-2 text-navy/60 transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label="Eliminar usuario"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <UserCreateModal
          onClose={() => setCreating(false)}
          onCreated={(user) => {
            setUsers((prev) => [user, ...prev]);
            setCreating(false);
          }}
        />
      )}

      {editing && (
        <UserEditModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setUsers((prev) =>
              prev.map((u) => (u.id === updated.id ? updated : u))
            );
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
