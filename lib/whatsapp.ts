import "server-only";

import { prisma } from "@/lib/prisma";
import {
  DEFAULT_WHATSAPP_MESSAGES,
  DEFAULT_WHATSAPP_NUMBER,
  normalizeWhatsAppNumber,
  WHATSAPP_MESSAGE_KEYS,
  WHATSAPP_SETTING_KEY,
  type WhatsAppMessageKey,
} from "@/lib/whatsapp-shared";

export {
  DEFAULT_WHATSAPP_MESSAGES,
  DEFAULT_WHATSAPP_NUMBER,
  formatWhatsAppDisplay,
  isValidWhatsAppMessage,
  isValidWhatsAppNumber,
  MAX_WHATSAPP_MESSAGE_LENGTH,
  normalizeWhatsAppNumber,
  WHATSAPP_MESSAGE_KEYS,
  WHATSAPP_MESSAGE_META,
  WHATSAPP_SETTING_KEY,
  whatsappHref,
  type WhatsAppMessageKey,
} from "@/lib/whatsapp-shared";

async function getSettingsMap(keys: string[]): Promise<Map<string, string>> {
  const settings = await prisma.platformSetting.findMany({
    where: { key: { in: keys } },
  });
  return new Map(settings.map((setting) => [setting.key, setting.value]));
}

export async function getWhatsAppNumber(): Promise<string> {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: WHATSAPP_SETTING_KEY },
    });
    return setting?.value ?? DEFAULT_WHATSAPP_NUMBER;
  } catch {
    return DEFAULT_WHATSAPP_NUMBER;
  }
}

export async function getWhatsAppMessages(): Promise<
  Record<WhatsAppMessageKey, string>
> {
  try {
    const map = await getSettingsMap(Object.values(WHATSAPP_MESSAGE_KEYS));
    return {
      contacto:
        map.get(WHATSAPP_MESSAGE_KEYS.contacto) ??
        DEFAULT_WHATSAPP_MESSAGES.contacto,
      membresia:
        map.get(WHATSAPP_MESSAGE_KEYS.membresia) ??
        DEFAULT_WHATSAPP_MESSAGES.membresia,
      proceso:
        map.get(WHATSAPP_MESSAGE_KEYS.proceso) ??
        DEFAULT_WHATSAPP_MESSAGES.proceso,
    };
  } catch {
    return { ...DEFAULT_WHATSAPP_MESSAGES };
  }
}

export async function getWhatsAppConfig(): Promise<{
  number: string;
  messages: Record<WhatsAppMessageKey, string>;
}> {
  try {
    const keys = [
      WHATSAPP_SETTING_KEY,
      ...Object.values(WHATSAPP_MESSAGE_KEYS),
    ];
    const map = await getSettingsMap(keys);

    return {
      number: map.get(WHATSAPP_SETTING_KEY) ?? DEFAULT_WHATSAPP_NUMBER,
      messages: {
        contacto:
          map.get(WHATSAPP_MESSAGE_KEYS.contacto) ??
          DEFAULT_WHATSAPP_MESSAGES.contacto,
        membresia:
          map.get(WHATSAPP_MESSAGE_KEYS.membresia) ??
          DEFAULT_WHATSAPP_MESSAGES.membresia,
        proceso:
          map.get(WHATSAPP_MESSAGE_KEYS.proceso) ??
          DEFAULT_WHATSAPP_MESSAGES.proceso,
      },
    };
  } catch {
    return {
      number: DEFAULT_WHATSAPP_NUMBER,
      messages: { ...DEFAULT_WHATSAPP_MESSAGES },
    };
  }
}

export async function setWhatsAppNumber(number: string): Promise<string> {
  const digits = normalizeWhatsAppNumber(number);

  await prisma.platformSetting.upsert({
    where: { key: WHATSAPP_SETTING_KEY },
    create: { key: WHATSAPP_SETTING_KEY, value: digits },
    update: { value: digits },
  });

  return digits;
}

export async function setWhatsAppMessages(
  messages: Partial<Record<WhatsAppMessageKey, string>>
): Promise<Record<WhatsAppMessageKey, string>> {
  const saved = await getWhatsAppMessages();

  for (const key of Object.keys(WHATSAPP_MESSAGE_KEYS) as WhatsAppMessageKey[]) {
    const value = messages[key]?.trim();
    if (value === undefined) continue;

    await prisma.platformSetting.upsert({
      where: { key: WHATSAPP_MESSAGE_KEYS[key] },
      create: { key: WHATSAPP_MESSAGE_KEYS[key], value },
      update: { value },
    });

    saved[key] = value;
  }

  return saved;
}
