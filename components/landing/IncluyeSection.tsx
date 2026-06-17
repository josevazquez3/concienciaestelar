import { FadeIn } from "./FadeIn";
import { GoldSeparator, SectionLabel } from "./SectionLabel";

const servicios = [
  {
    title: "Acompañamiento Astrológico Semanal",
    description:
      "Lecturas semanales del cielo aplicadas a tu proceso personal y colectivo.",
  },
  {
    title: "Astrología Ascensional Aplicada",
    description:
      "Mapas de activación para integrar frecuencias superiores en tu vida diaria.",
  },
  {
    title: "Tejido de la Red",
    description:
      "Conexión con una comunidad activa que sostiene y amplifica tu proceso.",
  },
  {
    title: "Canalización y Orden",
    description:
      "Registros Álmicos y Numerología para comprender tu misión y propósito.",
  },
  {
    title: "Observación Consciente",
    description:
      "Prácticas de presencia y discernimiento para habitar el momento presente.",
  },
  {
    title: "Espacio WhatsApp Continuo",
    description:
      "Canal de comunicación directo para consultas, compartir y sostener el vínculo.",
  },
];

export function IncluyeSection() {
  return (
    <section id="incluye" className="bg-gold px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="mb-12 text-center">
            <SectionLabel light>Experiencia integral</SectionLabel>
            <h2 className="display-title text-white">¿Qué incluye?</h2>
            <GoldSeparator className="bg-white/40" />
            <p className="mx-auto mt-4 max-w-2xl font-body italic text-white/90">
              Todo lo que necesitás para acompañar tu proceso de activación y
              expansión de consciencia, en un solo espacio.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((servicio, i) => (
            <FadeIn key={servicio.title} delay={i * 80}>
              <div className="group h-full rounded-card border border-white/30 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-navy-dark hover:bg-navy-dark">
                <span className="mb-3 block text-gold-light transition-colors duration-300 group-hover:text-white">
                  ✦
                </span>
                <h3 className="mb-2 font-display text-lg font-semibold text-white">
                  {servicio.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-white/85 transition-colors duration-300 group-hover:text-white">
                  {servicio.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={500}>
          <div className="mt-12 text-center">
            <a href="#precios" className="btn-outline-white">
              Acceder a todo esto
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
