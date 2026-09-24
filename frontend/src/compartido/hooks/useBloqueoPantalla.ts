// Screen Wake Lock: evita que la pantalla se apague mientras se cocina. Se vuelve a pedir al regresar a la app.
import { useEffect } from "react";

export function useBloqueoPantalla(activo: boolean) {
  useEffect(() => {
    if (!activo || !("wakeLock" in navigator)) return;
    let candado: WakeLockSentinel | null = null;

    const pedir = async () => {
      try {
        candado = await navigator.wakeLock.request("screen");
      } catch {
        /* el navegador puede negarlo (ej. bateria baja); no es critico */
      }
    };
    const alVolver = () => {
      if (document.visibilityState === "visible") pedir();
    };

    pedir();
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      document.removeEventListener("visibilitychange", alVolver);
      candado?.release();
    };
  }, [activo]);
}
