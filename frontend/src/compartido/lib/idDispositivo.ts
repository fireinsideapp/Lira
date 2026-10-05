// frontend/src/compartido/lib/idDispositivo.ts
export function obtenerIdDispositivo(): string {
  const clave = "lyra-dispositivo-id";
  let id = localStorage.getItem(clave);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(clave, id);
  }
  return id;
}