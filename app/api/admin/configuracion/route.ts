import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  DEFAULT_WHATSAPP_MESSAGES,
  formatWhatsAppDisplay,
  getWhatsAppConfig,
  isValidWhatsAppMessage,
  isValidWhatsAppNumber,
  setWhatsAppMessages,
  setWhatsAppNumber,
  type WhatsAppMessageKey,
} from "@/lib/whatsapp";
import {
  getPaymentDetails,
  isValidPaymentDetails,
  setPaymentDetails,
  type PaymentDetails,
} from "@/lib/payment-settings";
import { isAdmin } from "@/lib/roles";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const [config, paymentDetails] = await Promise.all([
    getWhatsAppConfig(),
    getPaymentDetails(),
  ]);

  return NextResponse.json({
    whatsappNumber: config.number,
    whatsappDisplay: formatWhatsAppDisplay(config.number),
    whatsappMessages: config.messages,
    paymentDetails,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { whatsappNumber, whatsappMessages, paymentDetails } = body as {
    whatsappNumber?: string;
    whatsappMessages?: Partial<Record<WhatsAppMessageKey, string>>;
    paymentDetails?: Partial<PaymentDetails>;
  };

  if (!whatsappNumber?.trim() && !whatsappMessages && !paymentDetails) {
    return NextResponse.json(
      { error: "No hay datos para actualizar" },
      { status: 400 }
    );
  }

  let savedNumber = (await getWhatsAppConfig()).number;

  if (whatsappNumber !== undefined) {
    if (!whatsappNumber.trim()) {
      return NextResponse.json(
        { error: "El número de WhatsApp es obligatorio" },
        { status: 400 }
      );
    }

    if (!isValidWhatsAppNumber(whatsappNumber)) {
      return NextResponse.json(
        {
          error:
            "Número inválido. Usá el formato +5492216014212 (10 a 15 dígitos).",
        },
        { status: 400 }
      );
    }

    savedNumber = await setWhatsAppNumber(whatsappNumber);
  }

  if (whatsappMessages) {
    for (const key of Object.keys(
      DEFAULT_WHATSAPP_MESSAGES
    ) as WhatsAppMessageKey[]) {
      const message = whatsappMessages[key];
      if (message !== undefined && !isValidWhatsAppMessage(message)) {
        return NextResponse.json(
          {
            error: `El mensaje "${key}" debe tener entre 1 y 500 caracteres.`,
          },
          { status: 400 }
        );
      }
    }
  }

  if (paymentDetails) {
    const merged = { ...(await getPaymentDetails()), ...paymentDetails };
    if (!isValidPaymentDetails(merged)) {
      return NextResponse.json(
        { error: "Algún dato bancario supera el largo permitido." },
        { status: 400 }
      );
    }
  }

  const savedMessages = whatsappMessages
    ? await setWhatsAppMessages(whatsappMessages)
    : (await getWhatsAppConfig()).messages;
  const savedPaymentDetails = paymentDetails
    ? await setPaymentDetails(paymentDetails)
    : await getPaymentDetails();

  return NextResponse.json({
    whatsappNumber: savedNumber,
    whatsappDisplay: formatWhatsAppDisplay(savedNumber),
    whatsappMessages: savedMessages,
    paymentDetails: savedPaymentDetails,
  });
}
