// Reproduce un audio (URL de blob) y permite cortarlo. La promesa siempre se resuelve, incluso si se corta.
let audioActual: HTMLAudioElement | null = null;
let terminarActual: (() => void) | null = null;

export function reproducirUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audioActual = audio;
    const terminar = () => {
      URL.revokeObjectURL(url);
      if (audioActual === audio) audioActual = null;
      terminarActual = null;
      resolve();
    };
    terminarActual = terminar;
    audio.onended = terminar;
    audio.onerror = terminar;
    audio.play().catch(terminar);
  });
}

export function detenerReproduccion() {
  audioActual?.pause();
  terminarActual?.();
}
