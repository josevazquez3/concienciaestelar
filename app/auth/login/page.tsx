import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/landing/Logo";
import { GoldSeparator } from "@/components/landing/SectionLabel";

export const metadata: Metadata = {
  title: "Ingresar | Consciencia Estelar",
  description: "Accedé a tu espacio en Consciencia Estelar.",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 py-8 sm:py-12">
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

        <div className="card-glass p-6 shadow-xl shadow-navy/10 sm:p-8 md:p-10">
          <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
            <Logo size="md" />
            <h1 className="mt-4 font-display text-xl font-semibold text-navy sm:mt-6 sm:text-2xl">
              Ingresar
            </h1>
            <GoldSeparator className="my-4" />
            <p className="font-body text-sm italic text-navy/70">
              Accedé a tu espacio de acompañamiento y membresía.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
