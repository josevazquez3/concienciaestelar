import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  padronClienteSelect,
  sanitizePadronInput,
  serializePadronCliente,
  validatePadronInput,
  type PadronClienteInput,
  type PadronClienteRecord,
} from "@/lib/clientes-padron-shared";

export {
  formatBirthDate,
  normalizeDocumento,
  PADRON_CLIENTES_HEADERS,
  padronClienteSelect,
  padronExportRows,
  parseBirthDate,
  parsePadronCsv,
  type PadronClienteInput,
  type PadronClienteRecord,
} from "@/lib/clientes-padron-shared";

export function buildPadronWhere(search?: string): Prisma.PadronClienteWhereInput {
  const query = search?.trim();
  if (!query) return {};

  return {
    OR: [
      { nombres: { contains: query, mode: "insensitive" } },
      { apellidos: { contains: query, mode: "insensitive" } },
      { documento: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { celular: { contains: query, mode: "insensitive" } },
      { residencia: { contains: query, mode: "insensitive" } },
    ],
  };
}

export async function importPadronRows(
  rows: PadronClienteInput[]
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  await prisma.$transaction(
    async (tx) => {
      for (const row of rows) {
        const data = {
          ...sanitizePadronInput(row),
          fechaNacimiento: row.fechaNacimiento,
        };

        const documento = data.documento;
        const email = data.email;

        let existing = null;

        if (documento) {
          existing = await tx.padronCliente.findFirst({
            where: { documento },
            select: { id: true },
          });
        }

        if (!existing && email) {
          existing = await tx.padronCliente.findFirst({
            where: { email },
            select: { id: true },
          });
        }

        if (existing) {
          await tx.padronCliente.update({
            where: { id: existing.id },
            data,
          });
          updated += 1;
        } else {
          await tx.padronCliente.create({ data });
          created += 1;
        }
      }
    },
    { timeout: 60_000 }
  );

  return { created, updated };
}

export async function listPadronClientes(search?: string) {
  const clientes = await prisma.padronCliente.findMany({
    where: buildPadronWhere(search),
    orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
    select: padronClienteSelect,
  });

  return clientes.map(serializePadronCliente);
}

export async function updatePadronCliente(
  id: string,
  input: PadronClienteInput
): Promise<PadronClienteRecord> {
  const validationError = validatePadronInput(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const existing = await prisma.padronCliente.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Cliente no encontrado");
  }

  const data = sanitizePadronInput(input);

  if (data.documento) {
    const duplicate = await prisma.padronCliente.findFirst({
      where: { documento: data.documento, NOT: { id } },
      select: { id: true },
    });
    if (duplicate) {
      throw new Error("Ya existe un cliente con ese DNI o pasaporte.");
    }
  }

  if (data.email) {
    const duplicate = await prisma.padronCliente.findFirst({
      where: { email: data.email, NOT: { id } },
      select: { id: true },
    });
    if (duplicate) {
      throw new Error("Ya existe un cliente con ese correo electrónico.");
    }
  }

  const updated = await prisma.padronCliente.update({
    where: { id },
    data: {
      ...data,
      fechaNacimiento: input.fechaNacimiento,
    },
    select: padronClienteSelect,
  });

  return serializePadronCliente(updated);
}

export async function createPadronCliente(
  input: PadronClienteInput
): Promise<PadronClienteRecord> {
  const validationError = validatePadronInput(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const data = sanitizePadronInput(input);

  if (data.documento) {
    const duplicate = await prisma.padronCliente.findFirst({
      where: { documento: data.documento },
      select: { id: true },
    });
    if (duplicate) {
      throw new Error("Ya existe un cliente con ese DNI o pasaporte.");
    }
  }

  if (data.email) {
    const duplicate = await prisma.padronCliente.findFirst({
      where: { email: data.email },
      select: { id: true },
    });
    if (duplicate) {
      throw new Error("Ya existe un cliente con ese correo electrónico.");
    }
  }

  const created = await prisma.padronCliente.create({
    data: {
      ...data,
      fechaNacimiento: input.fechaNacimiento,
    },
    select: padronClienteSelect,
  });

  return serializePadronCliente(created);
}

export async function deletePadronCliente(id: string): Promise<void> {
  try {
    await prisma.padronCliente.delete({ where: { id } });
  } catch {
    throw new Error("Cliente no encontrado");
  }
}

export async function deletePadronClientes(ids: string[]): Promise<number> {
  const result = await prisma.padronCliente.deleteMany({
    where: { id: { in: ids } },
  });
  return result.count;
}
