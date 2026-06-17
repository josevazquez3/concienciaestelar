import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { GoldSeparator } from "@/components/landing/SectionLabel";

export const metadata: Metadata = {
  title: "Registrarse | Consciencia Estelar",
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #2a3a5c 0%, #4a5a7a 30%, #c4b8a0 70%, #f5efe0 100%)",
        }}
      />
      <div className="texture-stars absolute inset-0 -z-10 opacity-40" />

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 font-ui text-sm text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <div className="card-glass p-8 text-center shadow-xl shadow-navy/10 md:p-10">
          <Logo size="md" />
          <h1 className="mt-6 font-display text-2xl font-semibold text-navy">
            Registro
          </h1>
          <GoldSeparator className="my-4" />
          <p className="mb-6 font-body text-sm text-navy/70">
            El registro público estará disponible en la próxima etapa.
          </p>
          <Link href="/auth/login" className="btn-primary inline-flex">
            Ir a Ingresar
          </Link>
        </div>
      </div>
    </div>
  );
}
