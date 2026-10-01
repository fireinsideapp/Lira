// frontend/src/funciones/cocina/useSesionCocina.ts
import { useEffect, useState } from "react";
import { detener, hablar } from "../../voz";
import { interpretarComando } from "../../voz/comandos/interpretarComando";
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

  // Declaradas como funciones normales para poder usarlas dentro de procesarTexto.
  const iniciar = () => setIndice(0);
  const siguiente = () => setIndice((i) => Math.min(i + 1, total));
  const anterior = () => setIndice((i) => Math.max(i - 1, 0));
  const repetir = () => (paso ? hablar(textoHablado(paso)) : undefined);

  const procesarTexto = (texto: string) => {
    const comando = interpretarComando(texto);
    switch (comando.tipo) {
      case "siguiente": return siguiente();
      case "anterior": return anterior();
      case "repetir": return repetir();
      case "temporizador":
        agregar(`manual-${Date.now()}`, "Temporizador", comando.segundos);
        return hablar(`Listo, puse un temporizador de ${Math.round(comando.segundos / 60)} minutos.`);
      case "desconocido":
        // Cuando exista el LLM, aqui se mandara el texto a la conversacion libre.
        return hablar("No te entendí bien. Puedes decir «siguiente», «repite» o «pon un temporizador».");
    }
  };

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

  useEffect(() => () => detener(), []);

  return {
    paso, total, iniciada, terminada, temporizadores, quitarTemporizador: quitar,
    esUltimo: indice === total - 1,
    iniciar, siguiente, anterior, repetir, procesarTexto,
  };
}