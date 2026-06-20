import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import { parseMercadoPagoPdfText } from "@/lib/bank-pdf-parser";
import { formatAmountForInput } from "@/lib/bank-statement-config";
import {
  annotateMovementDuplicates,
  findExistingMovementReferences,
} from "@/lib/bank-movements";

export const runtime = "nodejs";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No se recibió un archivo PDF" },
      { status: 400 }
    );
  }

  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "El archivo debe ser un PDF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: "El PDF supera el tamaño máximo de 10 MB" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    await parser.destroy();

    const parsed = parseMercadoPagoPdfText(textResult.text);

    if (parsed.movements.length === 0) {
      return NextResponse.json(
        {
          error:
            "No se encontraron movimientos en el PDF. Verificá que sea un extracto de Mercado Pago en pesos.",
        },
        { status: 400 }
      );
    }

    const existingReferences = await findExistingMovementReferences(
      parsed.movements.map((movement) => movement.ideOperacion)
    );

    const movementsWithDuplicateInfo = annotateMovementDuplicates(
      parsed.movements,
      existingReferences
    );

    const duplicateCount = movementsWithDuplicateInfo.filter(
      (movement) => movement.isDuplicate
    ).length;

    return NextResponse.json({
      fileName: file.name,
      periodo: parsed.periodo,
      saldoInicial: parsed.saldoInicial,
      saldoFinal: parsed.saldoFinal,
      saldoInicialFormatted:
        parsed.saldoInicial === null
          ? null
          : formatAmountForInput(parsed.saldoInicial),
      saldoFinalFormatted:
        parsed.saldoFinal === null
          ? null
          : formatAmountForInput(parsed.saldoFinal),
      duplicateCount,
      newCount: movementsWithDuplicateInfo.length - duplicateCount,
      movements: movementsWithDuplicateInfo.map((movement) => ({
        ...movement,
        movementDate: movement.movementDate.toISOString(),
        valorFormatted: formatAmountForInput(movement.valor),
        saldoFormatted: formatAmountForInput(movement.saldo),
      })),
    });
  } catch (error) {
    console.error("Error al parsear PDF:", error);
    return NextResponse.json(
      { error: "No se pudo leer el PDF del extracto bancario" },
      { status: 500 }
    );
  }
}
