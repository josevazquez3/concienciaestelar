import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listPagosDelMes } from "@/lib/pagos-del-mes";
import { isAdmin } from "@/lib/roles";

export async function GET(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const allMonths = searchParams.get("allMonths") === "true";

  const now = new Date();
  const month = Number(searchParams.get("month") ?? now.getMonth() + 1);
  const year = Number(searchParams.get("year") ?? now.getFullYear());

  if (!Number.isFinite(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Mes inválido" }, { status: 400 });
  }

  if (!Number.isFinite(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Año inválido" }, { status: 400 });
  }

  const data = await listPagosDelMes({
    month,
    year,
    allMonths,
    search,
  });

  return NextResponse.json(data);
}
