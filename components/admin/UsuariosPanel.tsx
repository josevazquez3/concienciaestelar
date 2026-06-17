"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { UserEditModal } from "./UserEditModal";

export type Usuario = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "CLIENTE";
  permissions: string[];
  active: boolean;
  createdAt: string;
};

export function UsuariosPanel() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Usuario | null>(null);

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
      <div className="overflow-x-auto rounded-card border border-gold/20 bg-white/60">
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
                <td className="px-4 py-3 text-navy/80">{user.email}</td>
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
