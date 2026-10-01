// frontend/src/voz/transcripcion/reconocimientoNavegador.ts
// Reconocimiento de voz GRATIS del navegador (Web Speech API). Funciona en Chrome (Android y escritorio).
// No funciona en Firefox ni en iOS Safari. No necesita ninguna clave ni backend.

export function hayReconocimientoNavegador(): boolean {
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function escucharNavegador(): Promise<string> {
  return new Promise((resolve, reject) => {
    const Reconocedor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Reconocedor) {
      reject(new Error("Este navegador no soporta reconocimiento de voz"));
      return;
    }

    const reconocimiento = new Reconocedor();
    reconocimiento.lang = "es-MX";
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;
    reconocimiento.maxAlternatives = 1;

    let resuelto = false;

    reconocimiento.onresult = (evento: any) => {
      resuelto = true;
      resolve(evento.results[0][0].transcript as string);
    };
    reconocimiento.onerror = (evento: any) => {
      resuelto = true;
      reject(new Error(evento.error));
    };
    reconocimiento.onend = () => {
      // Si termino sin disparar un resultado (silencio total), resolvemos vacio en vez de colgar la promesa.
      if (!resuelto) resolve("");
    };

    reconocimiento.start();
  });
}