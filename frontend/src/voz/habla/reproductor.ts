// Reproduce un audio (URL de blob) y permite cortarlo. La promesa siempre se resuelve, incluso si se corta.
let audioActual: HTMLAudioElement | null = null;
let terminarActual: (() => void) | null = null;

export function reproducirUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    // 1. Si ya hay un audio sonando, lo detenemos y limpiamos de inmediato para evitar el eco
    if (audioActual) {
      audioActual.pause();
      audioActual.currentTime = 0;
      terminarActual?.();
    }

    const audio = new Audio(url);
    audio.volume = 1.0; // Sube el volumen al 100% automáticamente por defecto
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
  if (audioActual) {
    audioActual.pause();
    audioActual.currentTime = 0;
  }
  terminarActual?.();
}