import { FadeIn } from "./FadeIn";
import { GoldSeparator, SectionLabel } from "./SectionLabel";
import { Logo } from "./Logo";

export function QueEsSection() {
  return (
    <section id="que-es" className="bg-cream px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="mb-12 text-center">
            <SectionLabel>Descubre</SectionLabel>
            <h2 className="display-title text-gold">
              ¿Qué es Consciencia Estelar?
            </h2>
            <GoldSeparator />
          </div>
        </FadeIn>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <FadeIn className="flex justify-center">
            <div className="flex h-48 w-48 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-br from-gold/10 to-white/60 shadow-lg md:h-64 md:w-64">
              <Logo size="lg" />
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="space-y-5 font-body text-navy/85">
              <p className="italic leading-relaxed">
                Consciencia Estelar es un espacio vivo de acompañamiento para
                quienes sienten que estamos atravesando un momento de
                transición profunda. Un lugar donde la astrología, la
                canalización y la observación consciente se integran en la vida
                cotidiana.
              </p>
              <p className="italic leading-relaxed">
                No es teoría.
                <br />
                No es información suelta.
              </p>
              <p className="text-lg font-bold text-navy">
                Es presencia aplicada a la vida cotidiana.
              </p>
              <blockquote className="border-l-4 border-gold pl-4 italic text-gold">
                &ldquo;Todo nuestro espacio está sostenido por un entramado de
                frecuencia que nos recuerda quiénes somos y hacia dónde
                vamos.&rdquo;
              </blockquote>
              <p className="leading-relaxed">
                Cada semana te acompañamos con lecturas astrológicas, prácticas
                de integración y un tejido comunitario que sostiene tu proceso
                de activación y expansión de consciencia.
              </p>
              <a href="#precios" className="btn-outline mt-4 inline-flex">
                Comenzar mi proceso
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
