// Hook generico para cargar datos: devuelve datos, error, cargando y una funcion para reintentar.
import { useEffect, useState } from "react";

export function useCarga<T>(cargar: () => Promise<T>, deps: unknown[]) {
  const [datos, setDatos] = useState<T | null>(null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vivo = true;
    setDatos(null);
    setError(false);
    cargar()
      .then((d) => vivo && setDatos(d))
      .catch(() => vivo && setError(true));
    return () => {
      vivo = false;
    };
  }, [...deps, intento]);

  return { datos, error, reintentar: () => setIntento((n) => n + 1) };
}
