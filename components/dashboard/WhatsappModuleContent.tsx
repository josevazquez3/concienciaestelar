import { ExternalLink } from "lucide-react";
import {
  formatWhatsAppDisplay,
  getWhatsAppConfig,
  whatsappHref,
} from "@/lib/whatsapp";

export async function WhatsappModuleContent() {
  const { number, messages } = await getWhatsAppConfig();
  const display = formatWhatsAppDisplay(number);
  const href = whatsappHref(number, messages.contacto);

  return (
    <div className="card-glass p-6 text-center sm:p-8">
      <p className="mb-2 font-body text-sm text-navy/70 sm:text-base">
        Contacto configurado para la comunidad:
      </p>
      <p className="mb-6 break-all font-display text-xl font-semibold text-navy sm:text-2xl">
        {display}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex w-full sm:w-auto"
      >
        Abrir WhatsApp Web
        <ExternalLink size={16} />
      </a>
      <p className="mt-4 font-body text-xs text-navy/50">
        Podés cambiar este número en Configuración (solo Admin).
      </p>
    </div>
  );
}
