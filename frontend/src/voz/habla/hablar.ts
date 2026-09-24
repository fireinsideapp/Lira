// Lyra habla: divide el texto en frases, pide el audio de cada una al backend (TTS con cache)
// y las reproduce en orden, pidiendo la siguiente mientras suena la actual.
// Si el backend no tiene TTS configurado (501) o falla, usa la voz del navegador.
import { useVoz } from "../useVoz";
import { detenerReproduccion, reproducirUrl } from "./reproductor";

let turno = 0;          // cada llamada nueva invalida a la anterior (para poder cortar)
let sinTTS = false;     // el backend respondio 501: no volver a intentar

export function dividirFrases(texto: string): string[] {
  return texto.split(/(?<=[.!?])\s+/).map((f) => f.trim()).filter(Boolean);
}

async function pedirAudio(texto: string): Promise<string | null> {
  try {
    const r = await fetch("/api/voz/hablar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
    });
    if (r.status === 501) sinTTS = true;
    if (!r.ok) return null;
    return URL.createObjectURL(await r.blob());
  } catch {
    return null;
  }
}

function hablarConNavegador(texto: string): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return resolve();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-MX";
    u.rate = 0.9;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

export async function hablar(texto: string): Promise<void> {
  const mio = ++turno;
  detenerReproduccion();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  useVoz.getState().setEstado("hablando");

  try {
    if (sinTTS) {
      await hablarConNavegador(texto);
      return;
    }
    const frases = dividirFrases(texto);
    let siguiente = pedirAudio(frases[0]);
    for (let i = 0; i < frases.length; i++) {
      const url = await siguiente;
      if (mio !== turno) return;
      if (i + 1 < frases.length) siguiente = pedirAudio(frases[i + 1]);
      if (!url) {
        await hablarConNavegador(frases.slice(i).join(" "));
        return;
      }
      await reproducirUrl(url);
      if (mio !== turno) return;
    }
  } finally {
    if (mio === turno) useVoz.getState().setEstado("espera");
  }
}

export function detener() {
  turno++;
  detenerReproduccion();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  useVoz.getState().setEstado("espera");
}
