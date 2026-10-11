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
    .replace(/\s+/g, " ")
    .trim();
}

function extraerSegundos(texto: string): number | null {
  const digitoSeg = texto.match(/(\d+)\s*(segundos?|seg)\b/);
  if (digitoSeg) return parseInt(digitoSeg[1], 10);

  const digito = texto.match(/(\d+)\s*(minutos?|min)\b/);
  if (digito) return parseInt(digito[1], 10) * 60;

  if (/media\s*hora/.test(texto)) return 30 * 60;
  if (/\bhora\b/.test(texto) && !/\bmedia\b/.test(texto)) return 60 * 60;

  const palabra = texto.match(/(\w+)\s*(minutos?|min)\b/);
  if (palabra && NUMEROS[palabra[1]]) return NUMEROS[palabra[1]] * 60;

  const palabraSeg = texto.match(/(\w+)\s*(segundos?|seg)\b/);
  if (palabraSeg && NUMEROS[palabraSeg[1]]) return NUMEROS[palabraSeg[1]];

  return null;
}

// Listas amplias de formas naturales de decir cada cosa.
// Si falla algo nuevo en las pruebas, solo hay que agregar la frase aqui, sin tocar nada mas.
const FRASES_SIGUIENTE = [
  "siguiente", "continua", "continuar", "sigue", "sigamos",
  "ya termine", "ya acabe", "termine", "acabe", "ya esta", "ya quedo",
  "avanza", "avancemos", "pasa al siguiente", "siguiente paso",
];
// Palabras muy cortas: solo cuentan si la frase completa es breve ("listo", "ok ya", "va").
// Asi "¿ya puedo apagar?" o "esta listo el arroz?" no se confunden con "siguiente".
const SIGUIENTE_CORTAS = ["ya", "ok", "va", "vale", "listo", "adelante", "andale"];
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

// Frases que empiezan como pregunta o piden permiso: van directo a Lyra (Gemini).
const ES_PREGUNTA =
  /^(puedo|puede|podria|podemos|se puede|como|cuanto|cuanta|cuantos|cuantas|cuando|que|por que|porque|donde|cual|cuales|es|esta|hay|lleva|tiene|sirve)\b|\b(puedo|podria|se puede|le puedo|le pongo|le agrego)\b/;

// Busca la frase como palabra(s) completa(s), no dentro de otra palabra.
function contieneAlguna(texto: string, lista: string[]): boolean {
  return lista.some((frase) => new RegExp(`\\b${frase}\\b`).test(texto));
}

export function interpretarComando(textoOriginal: string): Comando {
  const texto = normalizar(textoOriginal);
  if (!texto) return { tipo: "desconocido" };

  if (contieneAlguna(texto, FRASES_TEMPORIZADOR) || /\btimer\b/.test(texto)) {
    const segundos = extraerSegundos(texto);
    if (segundos) return { tipo: "temporizador", segundos };
  }

  // "repite", "que dijiste", etc. se revisan antes de la regla de preguntas.
  if (contieneAlguna(texto, FRASES_REPETIR)) return { tipo: "repetir" };

  // Una pregunta de cocina ("¿puedo usar tortillas de harina?") va a Lyra, no cambia de paso.
  if (ES_PREGUNTA.test(texto)) return { tipo: "desconocido" };

  if (contieneAlguna(texto, FRASES_SIGUIENTE)) return { tipo: "siguiente" };
  if (contieneAlguna(texto, FRASES_ANTERIOR)) return { tipo: "anterior" };

  const palabras = texto.split(" ").length;
  if (palabras <= 3 && contieneAlguna(texto, SIGUIENTE_CORTAS)) return { tipo: "siguiente" };

  return { tipo: "desconocido" };
}