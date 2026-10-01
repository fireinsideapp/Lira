// frontend/src/voz/comandos/interpretarComando.ts

export type Comando =
  | { tipo: "siguiente" }
  | { tipo: "anterior" }
  | { tipo: "repetir" }
  | { tipo: "temporizador"; segundos: number }
  | { tipo: "desconocido" };

const NUMEROS: Record<string, number> = {
  un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12,
  quince: 15, veinte: 20, veinticinco: 25, treinta: 30, cuarenta: 40, cincuenta: 50,
};

// Quita acentos, pasa a minusculas y limpia signos de puntuacion.
// Asi "¿Repíte?", "REPITE", "repite." y "repite" terminan comparandose igual.
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos (á -> a, é -> e, etc.)
    .replace(/[¿?¡!.,]/g, "")
    .trim();
}

function extraerMinutos(texto: string): number | null {
  const digito = texto.match(/(\d+)\s*(minutos?|min)/);
  if (digito) return parseInt(digito[1], 10);

  if (/media\s*hora/.test(texto)) return 30;
  if (/\bhora\b/.test(texto) && !/\bmedia\b/.test(texto)) return 60;

  const palabra = texto.match(/(\w+)\s*(minutos?|min)/);
  if (palabra && NUMEROS[palabra[1]]) return NUMEROS[palabra[1]];

  return null;
}

// Listas amplias de formas naturales de decir cada cosa.
// Si falla algo nuevo en las pruebas, solo hay que agregar la frase aqui, sin tocar nada mas.
const FRASES_SIGUIENTE = [
  "siguiente", "continua", "continuar", "sigue", "sigamos",
  "ya termine", "ya acabe", "termine", "acabe", "listo", "ya esta", "ya quedo",
  "ok siguiente", "vale siguiente", "ya", "adelante", "avanza", "avancemos",
  "pasa al siguiente", "siguiente paso", "ok", "va", "andale",
];
const FRASES_ANTERIOR = [
  "anterior", "atras", "regresa", "regresar", "regresame", "vuelve", "volver",
  "paso anterior", "el paso de antes", "retrocede",
];
const FRASES_REPETIR = [
  "repite", "repitelo", "repiteme", "otra vez", "de nuevo", "no entendi",
  "no te escuche", "no escuche", "puedes repetir", "dilo otra vez", "que dijiste",
  "como dijiste", "perdon no escuche",
];
const FRASES_TEMPORIZADOR = [
  "pon un temporizador", "poner un temporizador", "activa un temporizador",
  "inicia un temporizador", "pon una alarma", "activa una alarma", "pon un timer",
  "necesito un temporizador", "quiero un temporizador", "timer de", "alarma de",
];

function contieneAlguna(texto: string, lista: string[]): boolean {
  return lista.some((frase) => texto.includes(frase));
}

export function interpretarComando(textoOriginal: string): Comando {
  const texto = normalizar(textoOriginal);
  if (!texto) return { tipo: "desconocido" };

  if (contieneAlguna(texto, FRASES_TEMPORIZADOR) || /\btimer\b/.test(texto)) {
    const minutos = extraerMinutos(texto);
    if (minutos) return { tipo: "temporizador", segundos: minutos * 60 };
  }
  if (contieneAlguna(texto, FRASES_SIGUIENTE)) return { tipo: "siguiente" };
  if (contieneAlguna(texto, FRASES_ANTERIOR)) return { tipo: "anterior" };
  if (contieneAlguna(texto, FRASES_REPETIR)) return { tipo: "repetir" };

  return { tipo: "desconocido" };
}