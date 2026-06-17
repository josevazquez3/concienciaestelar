import { FadeIn } from "./FadeIn";
import { GoldSeparator, SectionLabel } from "./SectionLabel";
import { getWhatsAppConfig, whatsappHref } from "@/lib/whatsapp";
import {
  appendPaymentDetailsToMessage,
  getPaymentDetails,
} from "@/lib/payment-settings";
import { PaymentDetailsLines } from "./PaymentDetailsLines";

const incluyeItems = [
  "Acompañamiento astrológico semanal",
  "Encuentros en vivo por Zoom",
  "Salas de Luna Llena y Luna Nueva",
  "Biblioteca de prácticas y meditaciones",
  "E-book Activación del Avatar",
  "Espacio WhatsApp continuo",
  "Canalización y registros álmicos",
  "Descuentos en talleres y sesiones",
];

export async function PreciosSection() {
  const [{ number: whatsappNumber, messages }, paymentDetails] =
    await Promise.all([getWhatsAppConfig(), getPaymentDetails()]);
  const membresiaLink = whatsappHref(
    whatsappNumber,
    appendPaymentDetailsToMessage(messages.membresia, paymentDetails)
  );
  const procesoLink = whatsappHref(whatsappNumber, messages.proceso);

  return (
    <section
      id="precios"
      className="relative overflow-hidden px-4 py-20 md:py-28"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #1a2744 0%, #2a3a5c 40%, #3a4a6c 70%, #1a2744 100%)",
        }}
      />
      <div className="texture-stars absolute inset-0 -z-10 opacity-40" />

      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <div className="mb-12 text-center">
            <SectionLabel light>Intercambio</SectionLabel>
            <h2 className="display-title text-white">Unite a Consciencia Estelar</h2>
            <GoldSeparator className="bg-white/30" />
            <p className="mx-auto mt-4 max-w-xl font-body italic text-white/80">
              Elegí el plan que mejor se adapte a tu ubicación. Ambos incluyen
              acceso completo a toda la experiencia.
            </p>
          </div>
        </FadeIn>

        <div className="mb-10 grid gap-8 md:grid-cols-2">
          <FadeIn delay={100}>
            <div className="card-glass flex h-full flex-col p-6 sm:p-8">
              <p className="section-label mb-2 text-navy/60">Argentina</p>
              <p className="mb-1 font-display text-3xl font-bold text-gold sm:text-4xl">
                $80.000
                <span className="text-lg font-normal text-navy/60"> ARS/mes</span>
              </p>
              <p className="mb-6 font-body text-sm text-navy/70">
                Transferencia bancaria
                <br />
                <PaymentDetailsLines details={paymentDetails} />
              </p>
              <a
                href={membresiaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-auto w-full text-center"
              >
                🌙 Quiero Unirme (AR)
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="card-glass relative flex h-full flex-col p-6 pt-12 sm:p-8 sm:pt-8">
              <span className="absolute left-4 right-4 top-4 w-fit rounded-full bg-gold px-3 py-1 font-ui text-xs uppercase tracking-wider text-white sm:left-auto sm:right-4">
                Internacional
              </span>
              <p className="section-label mb-2 text-navy/60">Exterior</p>
              <p className="mb-1 font-display text-3xl font-bold text-gold sm:text-4xl">
                $80
                <span className="text-lg font-normal text-navy/60"> USD/mes</span>
              </p>
              <p className="mb-6 font-body text-sm text-navy/70">
                PayPal:{" "}
                <span className="font-semibold text-navy">
                  conscienciaestelar33@gmail.com
                </span>
              </p>
              <a
                href="mailto:conscienciaestelar33@gmail.com?subject=Membresía%20Internacional"
                className="btn-primary mt-auto w-full text-center"
              >
                🌍 Quiero Unirme (USD)
              </a>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={300}>
          <div className="card-glass mb-10 p-8">
            <h3 className="mb-6 text-center font-display text-xl font-semibold text-navy">
              Ambos planes incluyen:
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {incluyeItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start font-body text-sm text-navy/80"
                >
                  <span className="mr-2 shrink-0 text-gold">✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <div className="rounded-card border border-gold/40 bg-gold/10 p-6 text-center backdrop-blur-sm sm:p-8">
            <p className="mb-6 font-display text-lg font-semibold text-white sm:text-xl md:text-2xl">
              El momento de tu activación es ahora.
            </p>
            <a
              href={procesoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              ✦ Comenzar mi proceso
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
