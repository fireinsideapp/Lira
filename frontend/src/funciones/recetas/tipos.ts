// Tipos de receta. Deben coincidir con backend/app/esquemas/receta.py y con los JSON de datos_iniciales.
export interface Ingrediente {
  nombre: string;
  cantidad: string; // puede venir vacio
  grupo: string;    // ej. "Salsa roja", "Para servir"
}

export interface Paso {
  orden: number;
  texto: string;
  temporizador_segundos: number | null;
  temporizador_nombre: string | null;
  nota_seguridad: string | null;
  estufa: "encendida" | "apagar" | null;
}

export interface RecetaResumen {
  slug: string;
  titulo: string;
  descripcion: string;
  porciones: number | null;
}

export interface Receta extends RecetaResumen {
  ingredientes: Ingrediente[];
  pasos: Paso[];
}
