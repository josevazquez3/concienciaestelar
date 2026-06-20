import "server-only";

import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PAYMENT_DETAILS,
  PAYMENT_SETTING_KEYS,
  type PaymentDetailKey,
  type PaymentDetails,
} from "@/lib/payment-settings-shared";

export {
  appendPaymentDetailsToMessage,
  DEFAULT_PAYMENT_DETAILS,
  formatPaymentDetailsForWhatsApp,
  hasPaymentDetails,
  isValidPaymentDetails,
  PAYMENT_FIELD_META,
  PAYMENT_SETTING_KEYS,
  type PaymentDetailKey,
  type PaymentDetails,
} from "@/lib/payment-settings-shared";

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
