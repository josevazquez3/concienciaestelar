export const PAYMENT_SETTING_KEYS = {
  banco: "payment_banco",
  alias: "payment_alias",
  cbu: "payment_cbu",
  cvu: "payment_cvu",
  cuenta: "payment_cuenta",
} as const;

export type PaymentDetailKey = keyof typeof PAYMENT_SETTING_KEYS;

export type PaymentDetails = Record<PaymentDetailKey, string>;

export const DEFAULT_PAYMENT_DETAILS: PaymentDetails = {
  banco: "",
  alias: "Conscienciaestelar33",
  cbu: "",
  cvu: "",
  cuenta: "",
};

export const PAYMENT_FIELD_META: Record<
  PaymentDetailKey,
  { label: string; placeholder: string; maxLength: number }
> = {
  banco: { label: "Banco", placeholder: "Ej: Banco Galicia", maxLength: 80 },
  alias: {
    label: "Alias",
    placeholder: "Ej: Conscienciaestelar33",
    maxLength: 50,
  },
  cbu: { label: "CBU", placeholder: "22 dígitos", maxLength: 22 },
  cvu: { label: "CVU", placeholder: "Ej: 000000310001...", maxLength: 30 },
  cuenta: {
    label: "Cta.",
    placeholder: "Número de cuenta",
    maxLength: 30,
  },
};

export function hasPaymentDetails(details: PaymentDetails): boolean {
  return Object.values(details).some((value) => value.trim().length > 0);
}

export function isValidPaymentDetails(details: PaymentDetails): boolean {
  for (const key of Object.keys(PAYMENT_FIELD_META) as PaymentDetailKey[]) {
    const value = details[key]?.trim() ?? "";
    const maxLength = PAYMENT_FIELD_META[key].maxLength;
    if (value.length > maxLength) return false;
  }
  return true;
}

export function formatPaymentDetailsForWhatsApp(details: PaymentDetails): string {
  const lines = ["Datos para transferencia — Consciencia Estelar:"];

  for (const key of Object.keys(PAYMENT_FIELD_META) as PaymentDetailKey[]) {
    const value = details[key]?.trim();
    if (!value) continue;
    lines.push(`${PAYMENT_FIELD_META[key].label}: ${value}`);
  }

  return lines.length > 1 ? lines.join("\n") : "";
}

export function appendPaymentDetailsToMessage(
  message: string,
  details: PaymentDetails
): string {
  const paymentBlock = formatPaymentDetailsForWhatsApp(details);
  if (!paymentBlock) return message.trim();
  return `${message.trim()}\n\n${paymentBlock}`;
}
