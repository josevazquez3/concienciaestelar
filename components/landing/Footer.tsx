import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import { getWhatsAppConfig, whatsappHref } from "@/lib/whatsapp";
import { Logo } from "./Logo";

const footerLinks = [
  { href: "#que-es", label: "¿Qué es?" },
  { href: "#incluye", label: "Incluye" },
  { href: "#membresia", label: "Membresía" },
  { href: "#facilitadores", label: "Facilitadores" },
  { href: "#contacto", label: "Contacto" },
];

export async function Footer() {
  const { number: whatsappNumber, messages } = await getWhatsAppConfig();
  const whatsappLink = whatsappHref(whatsappNumber, messages.contacto);

  return (
    <footer className="bg-navy-dark px-4 py-16 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 flex justify-center">
          <Logo size="md" light />
        </div>

        <p className="mb-8 font-body italic text-white/70">
          Un espacio de encuentro para volver a mirar el cielo y reconocerte en
          él.
        </p>

        <nav className="mb-8">
          <ul className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-ui text-sm text-white/70 transition-colors hover:text-gold-light"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/auth/login"
                className="font-ui text-sm text-gold-light transition-colors hover:text-white"
              >
                Ingresar
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mb-8 flex items-center justify-center gap-4">
          <a
            href="https://instagram.com/marcelo.lacasa"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/20 p-3 text-white/70 transition-colors hover:border-gold hover:text-gold-light"
            aria-label="Instagram"
          >
            <Instagram size={20} />
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/20 p-3 text-white/70 transition-colors hover:border-gold hover:text-gold-light"
            aria-label="WhatsApp"
          >
            <MessageCircle size={20} />
          </a>
        </div>

        <div className="gold-separator mb-6 bg-white/20" />

        <p className="font-ui text-xs text-white/50">
          © 2026 Consciencia Estelar · Todos los derechos reservados
        </p>
        <p className="mt-2 font-body text-sm italic text-white/40">
          Hecho con <span className="text-gold">✦</span> amor y frecuencia
        </p>
      </div>
    </footer>
  );
}
