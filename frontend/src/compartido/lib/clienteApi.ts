// Cliente fetch base. Las rutas son relativas (/api/...) y pasan por el proxy de Vite.
export async function api<T>(ruta: string): Promise<T> {
  const respuesta = await fetch(`/api${ruta}`);
  if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
  return respuesta.json() as Promise<T>;
}
