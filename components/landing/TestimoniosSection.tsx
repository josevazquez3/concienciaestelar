"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn } from "./FadeIn";
import { GoldSeparator, SectionLabel } from "./SectionLabel";

const testimonios = [
  {
    nombre: "María G.",
    texto:
      "Consciencia Estelar llegó a mi vida en el momento exacto. El acompañamiento semanal me ayudó a integrar cambios profundos con mucha más claridad y presencia.",
  },
  {
    nombre: "Carlos R.",
    texto:
      "La comunidad es increíble. Sentir que no estoy solo en este proceso de transición me da una paz que no encontraba en ningún otro espacio.",
  },
  {
    nombre: "Lucía M.",
    texto:
      "Los encuentros de luna llena son mágicos. Cada ciclo me reconecta con mi propósito y me recuerda por qué elegí este camino de expansión.",
  },
  {
    nombre: "Andrea P.",
    texto:
      "La astrología aplicada de forma práctica cambió mi manera de habitar el día a día. Es presencia real, no teoría suelta.",
  },
];

export function TestimoniosSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % testimonios.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + testimonios.length) % testimonios.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, paused]);

  const t = testimonios[current];

  return (
    <section
      id="testimonios"
      className="relative overflow-hidden px-4 py-20 md:py-28"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, #e8dcc8 0%, #f5efe0 40%, #d4c4a8 100%)",
        }}
      />

      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <div className="mb-12 text-center">
            <SectionLabel>Voces de la red</SectionLabel>
            <h2 className="display-title text-gold">Testimonios</h2>
            <GoldSeparator />
            <p className="mx-auto mt-4 max-w-xl font-body italic text-navy/75">
              Lo que dicen quienes ya forman parte de esta red de frecuencia.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={150}>
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="card-glass relative px-8 py-12 text-center md:px-16">
              <span className="absolute left-6 top-4 font-display text-6xl leading-none text-gold/30 md:left-10 md:text-8xl">
                &ldquo;
              </span>
              <p className="relative z-10 mb-6 font-body text-lg italic leading-relaxed text-navy/85 md:text-xl">
                {t?.texto}
              </p>
              <p className="font-ui text-sm font-medium uppercase tracking-label text-gold">
                {t?.nombre}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={prev}
                className="rounded-full border border-gold/30 p-2 text-gold transition-colors hover:bg-gold/10"
                aria-label="Testimonio anterior"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-2">
                {testimonios.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrent(i)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      i === current ? "w-6 bg-gold" : "bg-gold/30"
                    )}
                    aria-label={`Ir al testimonio ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={next}
                className="rounded-full border border-gold/30 p-2 text-gold transition-colors hover:bg-gold/10"
                aria-label="Siguiente testimonio"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
