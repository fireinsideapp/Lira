import { obtenerIdDispositivo } from "../../compartido/lib/idDispositivo";

export interface Perfil {
  nombre: string | null;
  tratamiento: string;
}

const headersConDispositivo = {
  "Content-Type": "application/json",
  "X-Dispositivo-Id": obtenerIdDispositivo(),
};

export async function obtenerPerfil(): Promise<Perfil> {
  const r = await fetch("/api/perfil", { headers: headersConDispositivo });
  if (!r.ok) throw new Error(`Error ${r.status}`);
  return r.json();
}

export async function guardarNombre(nombre: string): Promise<Perfil> {
  const r = await fetch("/api/perfil", {
    method: "PUT",
    headers: headersConDispositivo,
    body: JSON.stringify({ nombre }),
  });
  if (!r.ok) throw new Error(`Error ${r.status}`);
  return r.json();
}