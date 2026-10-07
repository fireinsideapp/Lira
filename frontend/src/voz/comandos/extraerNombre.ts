function limpiar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function capitalizar(palabra: string): string {
  return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
}

export function extraerNombre(textoOriginal: string): string | null {
  const texto = limpiar(textoOriginal);

  // Patrones explicitos primero: "me llamo X", "mi nombre es X", "soy X"
  const patron = texto.match(/(?:me llamo|mi nombre es|soy)\s+([a-zA-Zñ]+)/i);
  if (patron) return capitalizar(patron[1]);

  // Si solo dijo una o dos palabras ("Carmen", "Carmen Lopez"), asumimos que es el nombre.
  const palabras = texto.split(/\s+/).filter(Boolean);
  if (palabras.length > 0 && palabras.length <= 2 && palabras.every((p) => /^[a-zA-Zñ]+$/.test(p))) {
    return palabras.map(capitalizar).join(" ");
  }

  return null;
}