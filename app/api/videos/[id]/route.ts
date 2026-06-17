import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import {
  parseVideoDate,
  validateVideoTitle,
  videoSelectFields,
} from "@/lib/videos";

type RouteContext = { params: { id: string } };

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { title, date, enabled } = body as {
    title?: string;
    date?: string;
    enabled?: boolean;
  };

  const data: { title?: string; date?: Date; enabled?: boolean } = {};

  if (title !== undefined) {
    if (!validateVideoTitle(title)) {
      return NextResponse.json(
        { error: "Título inválido (2 a 120 caracteres)" },
        { status: 400 }
      );
    }
    data.title = title.trim();
  }

  if (date !== undefined) {
    const parsedDate = parseVideoDate(date);
    if (!parsedDate) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }
    data.date = parsedDate;
  }

  if (enabled !== undefined) {
    data.enabled = enabled;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No hay cambios para guardar" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.video.update({
      where: { id: params.id },
      data,
      select: videoSelectFields,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Video no encontrado" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    await prisma.video.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Video no encontrado" }, { status: 404 });
  }
}
