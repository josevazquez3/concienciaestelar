import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { extractYouTubeId } from "@/lib/youtube";
import {
  parseVideoDate,
  validateVideoTitle,
  videoSelectFields,
} from "@/lib/videos";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const videos = await prisma.video.findMany({
    where: isAdmin(session) ? undefined : { enabled: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    select: videoSelectFields,
  });

  return NextResponse.json(videos);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { url, title, date } = body as {
    url?: string;
    title?: string;
    date?: string;
  };

  if (!url?.trim() || !title?.trim() || !date?.trim()) {
    return NextResponse.json(
      { error: "URL, título y fecha son obligatorios" },
      { status: 400 }
    );
  }

  const youtubeId = extractYouTubeId(url);
  if (!youtubeId) {
    return NextResponse.json(
      { error: "URL de YouTube inválida" },
      { status: 400 }
    );
  }

  if (!validateVideoTitle(title)) {
    return NextResponse.json(
      { error: "Título inválido (2 a 120 caracteres)" },
      { status: 400 }
    );
  }

  const parsedDate = parseVideoDate(date);
  if (!parsedDate) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  const created = await prisma.video.create({
    data: {
      url: url.trim(),
      youtubeId,
      title: title.trim(),
      date: parsedDate,
      enabled: true,
    },
    select: videoSelectFields,
  });

  return NextResponse.json(created);
}
