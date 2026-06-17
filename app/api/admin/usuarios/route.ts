import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISOS_DISPONIBLES } from "@/lib/permissions";
import { isAdmin } from "@/lib/roles";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, password, role, permissions, active } = body as {
    name?: string | null;
    email?: string;
    password?: string;
    role?: Role;
    permissions?: string[];
    active?: boolean;
  };

  if (!email?.trim() || !password) {
    return NextResponse.json(
      { error: "Email y contraseña son obligatorios" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  if (role && !Object.values(Role).includes(role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ya existe un usuario con ese email" },
      { status: 409 }
    );
  }

  const validPermissions = (permissions ?? []).filter((p) =>
    PERMISOS_DISPONIBLES.includes(p as (typeof PERMISOS_DISPONIBLES)[number])
  );

  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name?.trim() || null,
      email: normalizedEmail,
      password: hashedPassword,
      role: role ?? Role.CLIENTE,
      permissions: validPermissions,
      active: active ?? true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
