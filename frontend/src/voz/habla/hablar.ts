// Lyra habla: conexión fluida con ElevenLabs sin pausas forzadas.
import { useVoz } from "../useVoz";
import { detenerReproduccion, reproducirUrl } from "./reproductor";

let turno = 0;          
let sinTTS = false;    

export function dividirFrases(texto: string): string[] {
  const textoOptimizado = texto.replace(/[#*_`]/g, ""); 

  return textoOptimizado
    .split(/(?<=[.!?])\s+/)
    .map((f) => f.trim())
    .filter(Boolean);
}

async function pedirAudio(texto: string): Promise<string | null> {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    const r = await fetch(`${baseUrl}/api/voz/hablar`, {
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

function obtenerVozFemenina(): SpeechSynthesisVoice | null {
  if (!("speechSynthesis" in window)) return null;
  const voces = speechSynthesis.getVoices();
  
  const mejorVoz = voces.find(
    (v) => v.lang.startsWith("es") && (
      v.name.toLowerCase().includes("helena") ||
      v.name.toLowerCase().includes("sabina") ||
      v.name.toLowerCase().includes("paula") ||
      v.name.toLowerCase().includes("lucia") ||
      v.name.toLowerCase().includes("zira") ||
      v.name.toLowerCase().includes("dalia") ||
      v.name.toLowerCase().includes("mia") ||
      v.name.toLowerCase().includes("female") ||
      v.name.toLowerCase().includes("natural")
    )
  ) || voces.find((v) => v.lang.startsWith("es-MX")) || voces.find((v) => v.lang.startsWith("es"));

  return mejorVoz || null;
}

function hablarConNavegador(texto: string): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return resolve();
    speechSynthesis.cancel();
    
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-MX";
    u.rate = 0.82;  
    u.pitch = 1.12; 

    const voz = obtenerVozFemenina();
    if (voz) {
      u.voice = voz;
    }

    u.onend = () => resolve();
    u.onerror = () => resolve();
    
    speechSynthesis.speak(u);
  });
}

export async function hablar(texto: string): Promise<void> {
  const mio = ++turno;
  detenerReproduccion();
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
    if (speechSynthesis.getVoices().length === 0) {
      await new Promise<void>((resolve) => {
        speechSynthesis.onvoiceschanged = () => resolve();
        setTimeout(resolve, 100);
      });
    }
  }

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