// frontend/src/voz/transcripcion/transcribir.ts
export async function transcribir(audio: Blob): Promise<string> {
  const formulario = new FormData();
  formulario.append("audio", audio, "grabacion.webm");
  const r = await fetch("/api/voz/transcribir", { method: "POST", body: formulario });
  if (!r.ok) throw new Error("No se pudo transcribir");
  const { texto } = await r.json();
  return texto as string;
}