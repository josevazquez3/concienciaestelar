import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import {
  createPadronCliente,
  deletePadronClientes,
  importPadronRows,
  listPadronClientes,
  parseBirthDate,
  parsePadronCsv,
  type PadronClienteInput,
} from "@/lib/clientes-padron";

export async function GET(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const clientes = await listPadronClientes(search);

  return NextResponse.json({
    clientes,
    count: clientes.length,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const {
    nombres,
    apellidos,
    documento,
    fechaNacimiento,
    email,
    celular,
    residencia,
  } = body as {
    nombres?: string;
    apellidos?: string;
    documento?: string;
    fechaNacimiento?: string;
    email?: string;
    celular?: string;
    residencia?: string;
  };

  let parsedBirthDate: Date | null = null;
  if (fechaNacimiento?.trim()) {
    parsedBirthDate = parseBirthDate(fechaNacimiento);
    if (!parsedBirthDate) {
      return NextResponse.json(
        { error: "Fecha de nacimiento inválida (usá DD/MM/YYYY)" },
        { status: 400 }
      );
    }
  }

  const input: PadronClienteInput = {
    nombres: nombres ?? "",
    apellidos: apellidos ?? "",
    documento: documento ?? "",
    fechaNacimiento: parsedBirthDate,
    email: email ?? "",
    celular: celular ?? "",
    residencia: residencia ?? "",
  };

  try {
    const created = await createPadronCliente(input);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear";
    return NextResponse.json({ error: message }, { status: 400 });
  }
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

  const { rows, errors, warnings, mappedColumns, ignoredColumns } =
    parsePadronCsv(csv);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No hay filas válidas para importar" },
      { status: 400 }
    );
  }

  const { created, updated } = await importPadronRows(rows);
  const clientes = await listPadronClientes();

  return NextResponse.json({
    imported: created + updated,
    created,
    updated,
    warnings,
    mappedColumns,
    ignoredColumns,
    clientes,
    count: clientes.length,
  });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { ids } = body as { ids?: string[] };

  if (!ids?.length) {
    return NextResponse.json(
      { error: "Sin clientes seleccionados" },
      { status: 400 }
    );
  }

  const deleted = await deletePadronClientes(ids);
  return NextResponse.json({ deleted });
}
