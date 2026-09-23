/**
 * Tipos TypeScript: Receta, Ingrediente, Paso. Deben coincidir con el JSON de datos_iniciales/recetas y con los esquemas de Pydantic.
 */

export interface Ingrediente { nombre: string; cantidad: string }
export interface Paso {
  orden: number;
  texto: string;
  temporizador_segundos: number | null;
  nota_seguridad: string | null;
}
export interface Receta {
  slug: string;
  titulo: string;
  descripcion: string;
  porciones: number;
  ingredientes: Ingrediente[];
  pasos: Paso[];
}
