import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import {
  bankAccountSelectFields,
  validateBankAccountCode,
  validateBankAccountName,
  validateBankAccountOperatingCode,
} from "@/lib/bank-accounts";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const existing = await prisma.bankAccount.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
  }

  const body = await request.json();
  const { code, operatingCode, name, active } = body as {
    code?: string;
    operatingCode?: string;
    name?: string;
    active?: boolean;
  };

  const data: {
    code?: string;
    operatingCode?: string;
    name?: string;
    active?: boolean;
  } = {};

  if (code !== undefined) {
    if (!validateBankAccountCode(code)) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 });
    }
    const normalizedCode = code.trim();
    if (normalizedCode !== existing.code) {
      const duplicate = await prisma.bankAccount.findUnique({
        where: { code: normalizedCode },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "Ya existe una cuenta con ese código" },
          { status: 409 }
        );
      }
    }
    data.code = normalizedCode;
  }

  if (operatingCode !== undefined) {
    const opCode = operatingCode.trim();
    if (!validateBankAccountOperatingCode(opCode)) {
      return NextResponse.json(
        { error: "Código operativo inválido" },
        { status: 400 }
      );
    }
    data.operatingCode = opCode;
  }

  if (name !== undefined) {
    if (!validateBankAccountName(name)) {
      return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
    }
    data.name = name.trim();
  }

  if (active !== undefined) {
    data.active = Boolean(active);
  }

  const updated = await prisma.bankAccount.update({
    where: { id: params.id },
    data,
    select: bankAccountSelectFields,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const existing = await prisma.bankAccount.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
  }

  await prisma.bankAccount.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
