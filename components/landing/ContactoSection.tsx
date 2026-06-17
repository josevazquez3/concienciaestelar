import { Instagram, Mail, MessageCircle } from "lucide-react";
import {
  formatWhatsAppDisplay,
  getWhatsAppConfig,
  whatsappHref,
} from "@/lib/whatsapp";
import { getPaymentDetails } from "@/lib/payment-settings";
import { FadeIn } from "./FadeIn";
import { PaymentDetailsLines } from "./PaymentDetailsLines";
import { GoldSeparator, SectionLabel } from "./SectionLabel";

export async function ContactoSection() {
  const [{ number: whatsappNumber, messages }, paymentDetails] =
    await Promise.all([getWhatsAppConfig(), getPaymentDetails()]);
  const whatsappDisplay = formatWhatsAppDisplay(whatsappNumber);
  const whatsappLink = whatsappHref(whatsappNumber, messages.contacto);

  const canales = [
    {
      icon: MessageCircle,
      titulo: "WhatsApp",
      valor: whatsappDisplay,
      href: whatsappLink,
    },
    {
      icon: Instagram,
      titulo: "Instagram",
      valor: "@marcelo.lacasa",
      href: "https://instagram.com/marcelo.lacasa",
    },
    {
      icon: Mail,
      titulo: "Email",
      valor: "conscienciaestelar33@gmail.com",
      href: "mailto:conscienciaestelar33@gmail.com",
    },
  ];

  return (
    <section id="contacto" className="bg-cream px-4 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <div className="mb-12 text-center">
            <SectionLabel>Conectá con nosotros</SectionLabel>
            <h2 className="display-title text-gold">Contacto</h2>
            <GoldSeparator />
            <p className="mx-auto mt-4 max-w-xl font-body italic text-navy/75">
              Estamos acá para acompañarte. Escribinos por el canal que prefieras.
            </p>
          </div>
        </FadeIn>

        <div className="mb-10 grid gap-6 sm:grid-cols-3">
          {canales.map((c, i) => (
            <FadeIn key={c.titulo} delay={i * 100}>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="card-glass flex h-full flex-col items-center p-6 text-center transition-transform duration-300 hover:-translate-y-1"
              >
                <c.icon className="mb-4 h-8 w-8 text-gold" />
                <h3 className="mb-1 font-ui text-xs uppercase tracking-label text-navy/60">
                  {c.titulo}
                </h3>
                <p className="break-words font-body text-sm font-medium text-navy">
                  {c.valor}
                </p>
              </a>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={300}>
          <div className="card-glass p-8">
            <h3 className="mb-6 text-center font-display text-xl font-semibold text-navy">
              Datos de Pago
            </h3>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="section-label mb-2">Argentina (ARS)</p>
                <p className="font-body text-sm text-navy/80">
                  Transferencia bancaria
                  <br />
                  <PaymentDetailsLines details={paymentDetails} />
                  Monto:{" "}
                  <span className="font-semibold text-gold">$80.000 ARS/mes</span>
                </p>
              </div>
              <div>
                <p className="section-label mb-2">Exterior (USD)</p>
                <p className="font-body text-sm text-navy/80">
                  PayPal
                  <br />
                  <span className="font-semibold text-navy">
                    conscienciaestelar33@gmail.com
                  </span>
                  <br />
                  Monto:{" "}
                  <span className="font-semibold text-gold">$80 USD/mes</span>
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
