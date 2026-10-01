// frontend/src/voz/grabacion/useGrabadora.ts
// Graba mientras el boton esta presionado. Devuelve un Blob listo para enviar.
import { useRef, useState } from "react";

export function useGrabadora() {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const trozos = useRef<Blob[]>([]);
  const [grabando, setGrabando] = useState(false);

  const iniciar = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    trozos.current = [];
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    mr.ondataavailable = (e) => trozos.current.push(e.data);
    mr.start();
    mediaRecorder.current = mr;
    setGrabando(true);
  };

  const detener = (): Promise<Blob> =>
    new Promise((resolve) => {
      const mr = mediaRecorder.current;
      if (!mr) return resolve(new Blob());
      mr.onstop = () => {
        mr.stream.getTracks().forEach((t) => t.stop()); // apaga el microfono
        setGrabando(false);
        resolve(new Blob(trozos.current, { type: "audio/webm" }));
      };
      mr.stop();
    });

  return { grabando, iniciar, detener };
}