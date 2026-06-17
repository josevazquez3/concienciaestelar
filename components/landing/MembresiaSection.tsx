import { Video } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { GoldSeparator, SectionLabel } from "./SectionLabel";

const beneficios = [
  {
    icon: "🌕",
    title: "Salas de Luna Llena y Luna Nueva",
    description:
      "Encuentros especiales en cada ciclo lunar para ritual, integración y comunidad.",
  },
  {
    icon: "📘",
    title: "E-book · Activación del Avatar",
    description:
      "Material exclusivo para activar tu avatar energético y expandir tu consciencia.",
  },
  {
    icon: "🎧",
    title: "Biblioteca de Prácticas",
    description:
      "Acceso a meditaciones, audios y recursos para tu práctica diaria.",
  },
  {
    icon: "🎁",
    title: "Descuentos Especiales",
    description:
      "Beneficios exclusivos en talleres, sesiones y productos de la red.",
  },
];

export function MembresiaSection() {
  return (
    <section
      id="membresia"
      className="texture-fabric bg-cream px-4 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="mb-12 text-center">
            <SectionLabel>Más que una membresía</SectionLabel>
            <h2 className="display-title">
              <span className="text-navy">Accesos y Beneficios </span>
              <span className="text-gold">de la Membresía</span>
            </h2>
            <GoldSeparator />
            <p className="mx-auto mt-4 max-w-2xl font-body italic text-navy/75">
              Además del acompañamiento semanal, accedés a recursos, encuentros
              en vivo y una comunidad que te sostiene en cada paso.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="card-glass mb-10 p-8">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold/10">
                <Video className="h-8 w-8 text-gold" />
              </div>
              <div>
                <h3 className="mb-1 font-display text-xl font-semibold text-navy">
                  Encuentros en Vivo
                </h3>
                <p className="font-body text-navy/80">
                  <span className="font-semibold">Zoom</span> · Domingos de{" "}
                  <span className="font-semibold">10:00 a 12:00 hs</span>{" "}
                  (Argentina)
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2">
          {beneficios.map((b, i) => (
            <FadeIn key={b.title} delay={150 + i * 80}>
              <div className="card-glass h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                <span className="mb-3 block text-3xl">{b.icon}</span>
                <h3 className="mb-2 font-display text-lg font-semibold text-navy">
                  {b.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-navy/75">
                  {b.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={500}>
          <div className="mt-12 text-center">
            <a href="#precios" className="btn-primary">
              🚀 Ver Planes y Precios
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
