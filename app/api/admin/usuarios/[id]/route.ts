import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  const { role, permissions, active, name } = body as {
    role?: Role;
    permissions?: string[];
    active?: boolean;
    name?: string;
  };

  if (role && !Object.values(Role).includes(role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(role !== undefined && { role }),
      ...(permissions !== undefined && { permissions }),
      ...(active !== undefined && { active }),
      ...(name !== undefined && { name }),
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
