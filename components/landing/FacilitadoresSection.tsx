import Image from "next/image";
import { FadeIn } from "./FadeIn";
import { GoldSeparator, SectionLabel } from "./SectionLabel";

const facilitadores = [
  {
    nombre: "Guadalupe Vazquez",
    rol: "Puente entre cielo y tierra. Lectora del campo álmico y cuántico. Alquimista. Numeróloga. Arquitecta en las nuevas formas.",
    parrafos: [
      "Soy puente sagrado.",
      "Desde este lugar, acompaño a que lo sutil se traduzca en la materia.",
      "Desde muy chica estoy en contacto con lo que no siempre es visible, pero sí esencial: los campos de información.",
      "Hace más de 20 años recorro un camino de autoconocimiento, conciencia y exploración de lo sutil, integrando todo eso en la materia.",
      "Acompaño con propósito y dirección, donde se activan y ordenan dinámicas internas que impactan tanto a nivel individual como en lo colectivo.",
      "Mi principal labor consiste en leer el campo, canalizarlo y diseñar estructuras que permitan transformar lo que cada persona está atravesando.",
      "Me reconozco como una arquitecta de procesos de ascenso, al servicio del despliegue de una nueva humanidad.",
    ],
    tags: [
      "Registros Akáshicos",
      "Numerología",
      "Activaciones",
      "Procesos Grupales",
    ],
    imagen: "/images/facilitadores/guadalupe-vazquez.png",
  },
  {
    nombre: "Marcelo La Casa",
    rol: "Facilitador Espiritual · Maestro de Meditación · Guía de Anclajes",
    parrafos: [
      "Soy astrólogo evolutivo; Creador del enfoque Astrología Ascensional para estos tiempos; maestro de Reiki Usui, artista, actor y músico.",
      "Pero más allá de los títulos, soy un caminante de la conciencia.",
      "Desde muy temprano en mi vida, la intuición empezó a abrirse paso como una guía silenciosa pero constante. Una sensibilidad que me llevó a explorar lo invisible, a cuestionar lo establecido y a adentrarme en el mundo espiritual no como una creencia, sino como una experiencia viva.",
      "Mi camino fue —y es— un proceso de recordar, integrar y expandir. Cada herramienta que hoy comparto nace de esa búsqueda profunda por comprender la energía, el alma y los ciclos que nos atraviesan.",
      "En estos tiempos de cambio de era y transformación colectiva, acompaño a quienes sienten el llamado a despertar. A quienes saben que hay algo más, aunque todavía no puedan nombrarlo.",
      "Mi enfoque no es imponer verdades, sino abrir espacios de comprensión, donde cada persona pueda reconectarse con su propia guía interna, activar su conciencia y habitar su propósito con mayor claridad.",
      "Porque el verdadero despertar no viene de afuera. Es el momento en que el alma empieza a recordarse a sí misma.",
    ],
    tags: [
      "Meditación Profunda",
      "Anclajes Vibracionales",
      "Expansión de Consciencia",
      "Procesos Grupales",
    ],
    imagen: "/images/facilitadores/marcelo-la-casa.png",
  },
];

export function FacilitadoresSection() {
  return (
    <section
      id="facilitadores"
      className="texture-fabric bg-cream px-4 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="mb-14 text-center">
            <SectionLabel>Quiénes somos</SectionLabel>
            <h2 className="display-title">
              <span className="text-navy">Nuestros </span>
              <span className="text-gold">Facilitadores</span>
            </h2>
            <GoldSeparator />
            <p className="mx-auto mt-4 max-w-2xl font-body italic text-navy/75">
              Dos caminos, una misma frecuencia. Unidos por el propósito de
              acompañar el despertar de la nueva humanidad.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-8 lg:grid-cols-2">
          {facilitadores.map((f, i) => (
            <FadeIn key={f.nombre} delay={i * 150}>
              <article className="overflow-hidden rounded-[24px] bg-[#F5F0E1] shadow-xl shadow-navy/10">
                <div className="relative h-44 overflow-hidden sm:h-48">
                  <Image
                    src={f.imagen}
                    alt={f.nombre}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-12"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent, #F5F0E1)",
                    }}
                  />
                </div>

                <div className="space-y-4 px-6 pb-8 pt-5 sm:px-8">
                  <div>
                    <h3 className="font-display text-2xl font-semibold leading-tight text-navy sm:text-3xl">
                      {f.nombre}
                    </h3>
                    <p className="mt-2 font-body text-xs italic leading-snug text-gold sm:text-sm">
                      {f.rol}
                    </p>
                  </div>

                  {f.parrafos.map((parrafo) => (
                    <p
                      key={parrafo}
                      className="font-body text-sm leading-relaxed text-navy/80 sm:text-[15px]"
                    >
                      {parrafo}
                    </p>
                  ))}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {f.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#c5a47e] px-4 py-1.5 font-ui text-xs text-[#a8843a]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
