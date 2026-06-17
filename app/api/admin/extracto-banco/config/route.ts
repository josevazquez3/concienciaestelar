import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import {
  getStatementConfig,
  parseArsAmount,
  parseDateInput,
  updateStatementConfig,
} from "@/lib/bank-statement-config";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const config = await getStatementConfig();
  return NextResponse.json(config);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { initialBalance, initialBalanceDate } = body as {
    initialBalance?: number | string;
    initialBalanceDate?: string;
  };

  const balance =
    typeof initialBalance === "number"
      ? initialBalance
      : parseArsAmount(String(initialBalance ?? ""));

  if (balance === null && initialBalance !== 0) {
    return NextResponse.json({ error: "Saldo inicial inválido" }, { status: 400 });
  }

  const resolvedBalance = balance ?? 0;

  const balanceDate = initialBalanceDate
    ? parseDateInput(initialBalanceDate)
    : null;

  if (!balanceDate) {
    return NextResponse.json(
      { error: "Fecha de saldo inicial inválida" },
      { status: 400 }
    );
  }

  const config = await updateStatementConfig({
    initialBalance: resolvedBalance,
    initialBalanceDate: balanceDate,
  });

  return NextResponse.json(config);
}
