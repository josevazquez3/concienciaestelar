export const PERMISOS_DISPONIBLES = [
  "ver_contenido",
  "descargar_materiales",
  "acceso_biblioteca",
  "gestionar_usuarios",
] as const;

export type Permiso = (typeof PERMISOS_DISPONIBLES)[number];

export function formatPermiso(perm: string): string {
  return perm.replace(/_/g, " ");
}
