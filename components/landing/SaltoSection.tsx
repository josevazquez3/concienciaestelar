import { FadeIn } from "./FadeIn";
import { SectionLabel } from "./SectionLabel";

const items = [
  "Estamos viviendo un salto evolutivo sin precedentes en la historia humana.",
  "Las estructuras antiguas se desmoronan para dar paso a una nueva forma de habitar la Tierra.",
  "La astrología y la consciencia estelar nos ofrecen mapas para navegar esta transición.",
  "No estás solo/a: somos una red que se activa en coherencia y frecuencia.",
];

export function SaltoSection() {
  return (
    <section
      id="salto"
      className="relative overflow-hidden px-4 py-20 md:py-28"
    >
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(27,42,74,0.75), rgba(27,42,74,0.6)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')",
        }}
      />

      <div className="mx-auto max-w-4xl text-center">
        <FadeIn>
          <SectionLabel light>Momento de transición</SectionLabel>
          <h2 className="display-title mb-4">
            <span className="text-white">El Salto Hacia </span>
            <span className="text-gold-light">La Nueva Humanidad</span>
          </h2>
          <p className="mx-auto mb-10 max-w-2xl font-body italic text-white/85">
            Un llamado a despertar, integrar y habitar tu soberanía en este
            tiempo de grandes cambios.
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <ul className="mb-12 space-y-4 text-left md:mx-auto md:max-w-xl">
            {items.map((item) => (
              <li key={item} className="flex items-start font-body text-white/90">
                <span className="mr-3 mt-1 shrink-0 text-gold">✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="card-glass mx-auto mb-10 max-w-2xl p-8">
            <p className="font-body italic leading-relaxed text-navy/90">
              Este no es un momento para{" "}
              <span className="font-semibold text-gold">esperar</span>, sino
              para{" "}
              <span className="font-semibold text-gold">habitar</span> con
              presencia cada paso del camino. La{" "}
              <span className="font-semibold text-gold">nueva humanidad</span>{" "}
              se construye desde adentro hacia afuera, en comunidad y en
              coherencia.
            </p>
          </div>
          <a
            href="#precios"
            className="btn-outline border-white/60 text-white hover:bg-white/10"
          >
            Soy parte de este momento
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
