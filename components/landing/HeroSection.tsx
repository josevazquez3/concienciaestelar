import { ChevronDown } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { Logo } from "./Logo";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16"
    >
      {/* Fondo cosmos */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #2a3a5c 0%, #4a5a7a 25%, #8a9ab0 50%, #c4b8a0 75%, #e8dcc8 100%)",
        }}
      />
      <div className="texture-stars absolute inset-0 -z-10 opacity-60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-warm-white/30" />

      <div className="mx-auto max-w-4xl text-center">
        <FadeIn>
          <p className="section-label mb-6 text-white/80">
            Una nueva humanidad está emergiendo
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="mb-8 flex justify-center">
            <Logo size="lg" light />
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="mb-4 font-body text-lg italic text-white/90 md:text-xl lg:text-2xl">
            Un espacio de encuentro para volver a mirar el cielo y reconocerte
            en él.
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <p className="mx-auto mb-10 max-w-2xl font-body text-sm text-white/75 md:text-base">
            Una plataforma para habitar los procesos de este tiempo con
            presencia, discernimiento y soberanía.
          </p>
        </FadeIn>

        <FadeIn delay={400}>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#precios" className="btn-primary">
              ✦ Quiero Unirme
            </a>
            <a href="#que-es" className="btn-outline border-white/60 text-white hover:bg-white/10">
              Conocer Más
            </a>
          </div>
        </FadeIn>
      </div>

      <a
        href="#que-es"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-white/70 transition-colors hover:text-white"
      >
        <span className="font-ui text-xs uppercase tracking-label">Explorar</span>
        <ChevronDown size={20} className="animate-bounce-slow" />
      </a>
    </section>
  );
}
