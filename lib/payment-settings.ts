import { prisma } from "@/lib/prisma";

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

const PAYMENT_DB_KEYS = Object.values(PAYMENT_SETTING_KEYS);

async function getSettingsMap(keys: string[]): Promise<Map<string, string>> {
  const settings = await prisma.platformSetting.findMany({
    where: { key: { in: keys } },
  });
  return new Map(settings.map((setting) => [setting.key, setting.value]));
}

function mapToPaymentDetails(map: Map<string, string>): PaymentDetails {
  return {
    banco: map.get(PAYMENT_SETTING_KEYS.banco) ?? DEFAULT_PAYMENT_DETAILS.banco,
    alias: map.get(PAYMENT_SETTING_KEYS.alias) ?? DEFAULT_PAYMENT_DETAILS.alias,
    cbu: map.get(PAYMENT_SETTING_KEYS.cbu) ?? DEFAULT_PAYMENT_DETAILS.cbu,
    cvu: map.get(PAYMENT_SETTING_KEYS.cvu) ?? DEFAULT_PAYMENT_DETAILS.cvu,
    cuenta:
      map.get(PAYMENT_SETTING_KEYS.cuenta) ?? DEFAULT_PAYMENT_DETAILS.cuenta,
  };
}

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

export async function getPaymentDetails(): Promise<PaymentDetails> {
  try {
    const map = await getSettingsMap(PAYMENT_DB_KEYS);
    return mapToPaymentDetails(map);
  } catch {
    return { ...DEFAULT_PAYMENT_DETAILS };
  }
}

export async function setPaymentDetails(
  details: Partial<PaymentDetails>
): Promise<PaymentDetails> {
  const saved = await getPaymentDetails();

  for (const key of Object.keys(PAYMENT_SETTING_KEYS) as PaymentDetailKey[]) {
    if (details[key] === undefined) continue;

    const value = details[key]?.trim() ?? "";

    await prisma.platformSetting.upsert({
      where: { key: PAYMENT_SETTING_KEYS[key] },
      create: { key: PAYMENT_SETTING_KEYS[key], value },
      update: { value },
    });

    saved[key] = value;
  }

  return saved;
}
