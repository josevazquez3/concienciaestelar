import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import {
  deletePadronCliente,
  parseBirthDate,
  updatePadronCliente,
  type PadronClienteInput,
} from "@/lib/clientes-padron";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: RouteParams) {
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
    const updated = await updatePadronCliente(params.id, input);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al guardar";
    const status = message.includes("encontrado") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    await deletePadronCliente(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Cliente no encontrado" },
      { status: 404 }
    );
  }
}
