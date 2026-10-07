// frontend/src/funciones/cocina/useSesionCocina.ts
import { useEffect, useState } from "react";
import { detener, hablar } from "../../voz";
import { interpretarComando } from "../../voz/comandos/interpretarComando";
import { preguntarLyra } from "../conversacion/api";
import { obtenerPerfil } from "../perfil/api";
import { useTemporizadores } from "../temporizadores/useTemporizadores";
import type { Paso, Receta } from "../recetas/tipos";

const textoPaso = (p: Paso) =>
  `Paso ${p.orden}. ${p.texto}${p.nota_seguridad ? ` ${p.nota_seguridad}` : ""}`;

export function useSesionCocina(receta: Receta) {
  const { pasos } = receta;
  const total = pasos.length;
  const [indice, setIndice] = useState(-1);
  const [nombre, setNombre] = useState<string | null>(null);
  const { temporizadores, agregar, quitar } = useTemporizadores();

  // Si falla la carga del perfil, seguimos sin nombre: nunca bloquea la receta.
  useEffect(() => {
    obtenerPerfil()
      .then((p) => setNombre(p.nombre))
      .catch(() => setNombre(null));
  }, []);

  const iniciada = indice >= 0;
  const terminada = indice >= total;
  const paso = iniciada && !terminada ? pasos[indice] : null;

  const iniciar = () => setIndice(0);
  const siguiente = () => setIndice((i) => Math.min(i + 1, total));
  const anterior = () => setIndice((i) => Math.max(i - 1, 0));
  const repetir = () => (paso ? hablar(textoPaso(paso)) : undefined);

  const procesarTexto = async (texto: string) => {
    const comando = interpretarComando(texto);
    switch (comando.tipo) {
      case "siguiente": return siguiente();
      case "anterior": return anterior();
      case "repetir": return repetir();
      case "temporizador":
        agregar(`manual-${Date.now()}`, "Temporizador", comando.segundos);
        return hablar(`Listo, puse un temporizador de ${Math.round(comando.segundos / 60)} minutos.`);
      case "desconocido": {
        if (!paso) return hablar("No te entendí bien.");
        try {
          const respuesta = await preguntarLyra(receta.titulo, paso.texto, texto);
          return hablar(respuesta);
        } catch {
          return hablar("No pude pensar en eso ahora. Puedes decir «siguiente» o «repite».");
        }
      }
    }
  };

  useEffect(() => {
    if (!iniciada) return;
    if (terminada) {
      hablar(`¡Terminamos${nombre ? `, ${nombre}` : ""}! Buen provecho.`);
      return;
    }
    const p = pasos[indice];
    const texto =
      indice === 0
        ? `Vamos a preparar ${receta.titulo}${nombre ? `, ${nombre}` : ""}. ${textoPaso(p)}`
        : textoPaso(p);
    hablar(texto);
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