// Sesion de cocina (fase 1, en el cliente): paso actual, avanzar, retroceder, repetir.
// indice: -1 = sin empezar, 0..n-1 = paso actual, n = terminada.
// Semana 2: el estado se mueve al servidor (servicio_cocina) para que Lyra y los comandos de voz lo compartan.
import { useEffect, useState } from "react";
import { detener, hablar } from "../../voz";
import { useTemporizadores } from "../temporizadores/useTemporizadores";
import type { Paso, Receta } from "../recetas/tipos";

const textoHablado = (p: Paso) =>
  `Paso ${p.orden}. ${p.texto}${p.nota_seguridad ? ` ${p.nota_seguridad}` : ""}`;

export function useSesionCocina(receta: Receta) {
  const { pasos } = receta;
  const total = pasos.length;
  const [indice, setIndice] = useState(-1);
  const { temporizadores, agregar, quitar } = useTemporizadores();

  const iniciada = indice >= 0;
  const terminada = indice >= total;
  const paso = iniciada && !terminada ? pasos[indice] : null;

  // Al cambiar de paso: Lyra lo lee y, si trae tiempo, arranca su temporizador.
  useEffect(() => {
    if (!iniciada) return;
    if (terminada) {
      hablar("¡Terminamos! Buen provecho.");
      return;
    }
    const p = pasos[indice];
    hablar(textoHablado(p));
    if (p.temporizador_segundos) {
      agregar(`paso-${p.orden}`, p.temporizador_nombre ?? `Paso ${p.orden}`, p.temporizador_segundos);
    }
  }, [indice]);

  // Al salir de la pantalla, Lyra deja de hablar.
  useEffect(() => () => detener(), []);

  return {
    paso, total, iniciada, terminada, temporizadores, quitarTemporizador: quitar,
    esUltimo: indice === total - 1,
    iniciar: () => setIndice(0),
    siguiente: () => setIndice((i) => Math.min(i + 1, total)),
    anterior: () => setIndice((i) => Math.max(i - 1, 0)),
    repetir: () => (paso ? hablar(textoHablado(paso)) : undefined),
  };
}