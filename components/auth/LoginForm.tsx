"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Completá tu email y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "No se pudo iniciar sesión. Verificá email y contraseña, o que la base de datos Neon esté configurada en .env.local."
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("No se pudo iniciar sesión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block font-ui text-xs uppercase tracking-label text-navy/60"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="input-field"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block font-ui text-xs uppercase tracking-label text-navy/60"
        >
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-navy/50 transition-colors hover:text-gold"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="break-words rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 font-body text-sm text-navy/80">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Ingresando...
          </>
        ) : (
          "Ingresar"
        )}
      </button>

      <p className="text-center font-body text-sm text-navy/60">
        ¿No tenés cuenta?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-gold transition-colors hover:text-gold-light"
        >
          Registrate
        </Link>
      </p>
    </form>
  );
}
