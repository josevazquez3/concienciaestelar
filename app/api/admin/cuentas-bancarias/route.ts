import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import {
  bankAccountSelectFields,
  parseBankAccountsCsv,
  validateBankAccountCode,
  validateBankAccountName,
  validateBankAccountOperatingCode,
} from "@/lib/bank-accounts";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const accounts = await prisma.bankAccount.findMany({
    orderBy: [{ code: "asc" }, { name: "asc" }],
    select: bankAccountSelectFields,
  });

  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { code, operatingCode, name, active } = body as {
    code?: string;
    operatingCode?: string;
    name?: string;
    active?: boolean;
  };

  if (!code?.trim() || !name?.trim()) {
    return NextResponse.json(
      { error: "Código y nombre son obligatorios" },
      { status: 400 }
    );
  }

  if (!validateBankAccountCode(code)) {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }

  if (!validateBankAccountName(name)) {
    return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
  }

  const opCode = operatingCode?.trim() ?? "";
  if (!validateBankAccountOperatingCode(opCode)) {
    return NextResponse.json(
      { error: "Código operativo inválido" },
      { status: 400 }
    );
  }

  const normalizedCode = code.trim();
  const existing = await prisma.bankAccount.findUnique({
    where: { code: normalizedCode },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese código" },
      { status: 409 }
    );
  }

  const created = await prisma.bankAccount.create({
    data: {
      code: normalizedCode,
      operatingCode: opCode,
      name: name.trim(),
      active: active ?? true,
    },
    select: bankAccountSelectFields,
  });

  return NextResponse.json(created, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { csv } = body as { csv?: string };

  if (!csv?.trim()) {
    return NextResponse.json(
      { error: "No se recibió contenido para importar" },
      { status: 400 }
    );
  }

  const { rows, errors } = parseBankAccountsCsv(csv);
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No hay filas válidas para importar" },
      { status: 400 }
    );
  }

  const codes = rows.map((row) => row.code);
  const duplicateCodes = codes.filter(
    (code, index) => codes.indexOf(code) !== index
  );
  if (duplicateCodes.length > 0) {
    return NextResponse.json(
      {
        error: `Códigos duplicados en el archivo: ${Array.from(new Set(duplicateCodes)).join(", ")}`,
      },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    let created = 0;
    let updated = 0;

    for (const row of rows) {
      const existing = await tx.bankAccount.findUnique({
        where: { code: row.code },
      });

      if (existing) {
        await tx.bankAccount.update({
          where: { id: existing.id },
          data: {
            operatingCode: row.operatingCode,
            name: row.name,
            active: row.active,
          },
        });
        updated += 1;
      } else {
        await tx.bankAccount.create({
          data: row,
        });
        created += 1;
      }
    }

    return { created, updated };
  });

  const accounts = await prisma.bankAccount.findMany({
    orderBy: [{ code: "asc" }, { name: "asc" }],
    select: bankAccountSelectFields,
  });

  return NextResponse.json({
    ...result,
    total: rows.length,
    accounts,
  });
}
