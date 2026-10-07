// frontend/src/funciones/recetas/buscarReceta.ts
// Busqueda simple por palabras clave, sin LLM. Puede devolver 0, 1 o varias coincidencias.
import type { RecetaResumen } from "./tipos";

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,]/g, "")
    .trim();
}

const RELLENO = [
  "quiero", "quisiera", "me gustaria", "tengo ganas de", "hacer", "preparar",
  "cocinar", "algo de", "unos", "unas", "un", "una", "hoy", "por favor",
];

function limpiarPeticion(texto: string): string {
  let limpio = normalizar(texto);
  for (const palabra of RELLENO) {
    limpio = limpio.replace(new RegExp(`\\b${palabra}\\b`, "g"), "");
  }
  return limpio.replace(/\s+/g, " ").trim();
}

/** Busca todas las recetas que coincidan con lo que pidió la persona. */
export function buscarRecetas(peticion: string, recetas: RecetaResumen[]): RecetaResumen[] {
  const texto = limpiarPeticion(peticion);
  if (!texto) return [];

  // 1. Coincidencia por titulo completo (en cualquier direccion), ej. "chilaquiles" -> ambas variantes
  let encontradas = recetas.filter(
    (r) => normalizar(r.titulo).includes(texto) || texto.includes(normalizar(r.titulo))
  );
  if (encontradas.length > 0) return encontradas;

  // 2. Coincidencia por palabra suelta, como respaldo
  const palabras = texto.split(" ").filter((p) => p.length > 2);
  encontradas = recetas.filter((r) => {
    const tituloNorm = normalizar(r.titulo);
    return palabras.some((p) => tituloNorm.includes(p));
  });
  return encontradas;
}

/** Entre pocas opciones ya acotadas, identifica cual eligio la persona en su segunda respuesta. */
export function elegirEntre(respuesta: string, opciones: RecetaResumen[]): RecetaResumen | null {
  const texto = normalizar(respuesta);
  return (
    opciones.find((r) => {
      const palabrasTitulo = normalizar(r.titulo).split(" ");
      return palabrasTitulo.some((palabra) => palabra.length > 2 && texto.includes(palabra));
    }) ?? null
  );
}