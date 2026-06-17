import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISOS_DISPONIBLES } from "@/lib/permissions";
import { isAdmin } from "@/lib/roles";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { role, permissions, active, name, password } = body as {
    role?: Role;
    permissions?: string[];
    active?: boolean;
    name?: string;
    password?: string;
  };

  if (role && !Object.values(Role).includes(role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  if (password !== undefined && password !== "") {
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }
  }

  const validPermissions =
    permissions !== undefined
      ? permissions.filter((p) =>
          PERMISOS_DISPONIBLES.includes(
            p as (typeof PERMISOS_DISPONIBLES)[number]
          )
        )
      : undefined;

  if (active === false && session?.user?.id === params.id) {
    return NextResponse.json(
      { error: "No podés desactivar tu propia cuenta" },
      { status: 400 }
    );
  }

  const hashedPassword =
    password && password.length > 0 ? await hash(password, 12) : undefined;

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(role !== undefined && { role }),
      ...(validPermissions !== undefined && { permissions: validPermissions }),
      ...(active !== undefined && { active }),
      ...(name !== undefined && { name }),
      ...(hashedPassword && { password: hashedPassword }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      active: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (session?.user?.id === params.id) {
    return NextResponse.json(
      { error: "No podés eliminar tu propia cuenta" },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
