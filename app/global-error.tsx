"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es-AR">
      <body className="bg-cream font-body text-navy">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="max-w-md rounded-2xl border border-gold/20 bg-white p-8 text-center shadow-lg">
            <h1 className="text-xl font-semibold">Error de la aplicación</h1>
            <p className="mt-3 text-sm text-navy/70">
              Reiniciá la página o volvé a intentar en unos segundos.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-xl bg-navy px-5 py-2.5 text-sm text-white"
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
