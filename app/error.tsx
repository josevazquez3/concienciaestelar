"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="card-glass max-w-md p-8 text-center">
        <h1 className="font-display text-xl font-semibold text-navy">
          Algo salió mal
        </h1>
        <p className="mt-3 font-body text-sm text-navy/70">
          Ocurrió un error inesperado. Podés intentar de nuevo.
        </p>
        <button type="button" onClick={reset} className="btn-primary mt-6">
          Reintentar
        </button>
      </div>
    </div>
  );
}
