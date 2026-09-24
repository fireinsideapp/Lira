// Rutas: / (inicio), /recetas, /recetas/:slug
import { Navigate, Route, Routes } from "react-router-dom";
import CocinaPagina from "./funciones/cocina/CocinaPagina";
import InicioPagina from "./funciones/inicio/InicioPagina";
import ListaRecetasPagina from "./funciones/recetas/ListaRecetasPagina";

export function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<InicioPagina />} />
      <Route path="/recetas" element={<ListaRecetasPagina />} />
      {/* Apuntamos la ruta directo a CocinaPagina */}
      <Route path="/recetas/:slug" element={<CocinaPagina />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}