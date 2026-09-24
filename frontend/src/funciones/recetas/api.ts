// Llamadas al backend y hooks de recetas.
import { api } from "../../compartido/lib/clienteApi";
import { useCarga } from "../../compartido/hooks/useCarga";
import type { Receta, RecetaResumen } from "./tipos";

export const useRecetas = () => useCarga(() => api<RecetaResumen[]>("/recetas"), []);
export const useReceta = (slug: string) => useCarga(() => api<Receta>(`/recetas/${slug}`), [slug]);
