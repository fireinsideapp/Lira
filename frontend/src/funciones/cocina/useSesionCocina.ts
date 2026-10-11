// frontend/src/funciones/cocina/useSesionCocina.ts
import { useEffect, useRef, useState } from "react";
import { detener, hablar } from "../../voz";
import { interpretarComando } from "../../voz/comandos/interpretarComando";
import { preguntarLyra } from "../conversacion/api";
import { obtenerPerfil } from "../perfil/api";
import { useTemporizadores } from "../temporizadores/useTemporizadores";
import type { Paso, Receta } from "../recetas/tipos";

const textoPaso = (p: Paso) =>
  `Paso ${p.orden}. ${p.texto}${p.nota_seguridad ? ` ${p.nota_seguridad}` : ""}`;

// Convierte segundos a texto hablado: "30 segundos", "5 minutos", "1 minuto y 30 segundos".
function duracionHablada(segundos: number): string {
  if (segundos < 60) return `${segundos} segundos`;
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  const minutos = m === 1 ? "1 minuto" : `${m} minutos`;
  return s === 0 ? minutos : `${minutos} y ${s} segundos`;
}

export function useSesionCocina(receta: Receta) {
  const { pasos } = receta;
  const total = pasos.length;
  const [indice, setIndice] = useState(-1);
  const [nombre, setNombre] = useState<string | null>(null);
  const { temporizadores, agregar, quitar } = useTemporizadores();

  // Frase de confirmación que se dice justo antes de leer el paso (para que no se empalmen dos voces).
  const prefijoRef = useRef("");
  const introDichaRef = useRef(false);

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

  const siguiente = () => {
    if (!iniciada) return hablar("Primero toca el botón empezar a cocinar.");
    if (terminada) return;
    prefijoRef.current = "Listo, vamos al siguiente. ";
    setIndice((i) => Math.min(i + 1, total));
  };

  const anterior = () => {
    if (!iniciada) return hablar("Primero toca el botón empezar a cocinar.");
    if (indice === 0) return hablar("Ya estás en el primer paso.");
    prefijoRef.current = "Regresamos. ";
    setIndice((i) => Math.max(i - 1, 0));
  };

  const repetir = () =>
    paso ? hablar(`Claro, te lo repito. ${textoPaso(paso)}`) : undefined;

  const procesarTexto = async (texto: string) => {
    const comando = interpretarComando(texto);
    switch (comando.tipo) {
      case "siguiente": return siguiente();
      case "anterior": return anterior();
      case "repetir": return repetir();
      case "temporizador":
        agregar(`manual-${Date.now()}`, "Temporizador", comando.segundos);
        return hablar(`Listo, puse un temporizador de ${duracionHablada(comando.segundos)}.`);
      case "desconocido": {
        if (!paso) return hablar("No te entendí bien. Puedes decir «empezar» cuando estés listo.");
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

    // La presentación inicial solo se dice la primera vez, no cada vez que se regresa al paso 1.
    let texto: string;
    if (indice === 0 && !introDichaRef.current) {
      introDichaRef.current = true;
      texto = `Vamos a preparar ${receta.titulo}${nombre ? `, ${nombre}` : ""}. ${textoPaso(p)}`;
    } else {
      texto = `${prefijoRef.current}${textoPaso(p)}`;
    }
    prefijoRef.current = "";

    // Confirma que el temporizador del paso ya quedó puesto.
    if (p.temporizador_segundos) {
      texto += ` Ya puse el temporizador de ${duracionHablada(p.temporizador_segundos)}.`;
    }

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