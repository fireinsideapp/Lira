// frontend/src/funciones/conversacion/api.ts
import { obtenerIdDispositivo } from "../../compartido/lib/idDispositivo";

export async function preguntarLyra(recetaTitulo: string, pasoTexto: string, pregunta: string): Promise<string> {
  const r = await fetch("/api/conversacion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Dispositivo-Id": obtenerIdDispositivo(),
    },
    body: JSON.stringify({ receta_titulo: recetaTitulo, paso_texto: pasoTexto, pregunta }),
  });
  if (!r.ok) throw new Error(`Error ${r.status}`);
  const { respuesta } = await r.json();
  return respuesta as string;
}