// Rutas: / (inicio), /recetas, /recetas/:slug, /cocina/:slug
import { Navigate, Route, Routes } from "react-router-dom";
import InicioPagina from "./funciones/inicio/InicioPagina";
import ListaRecetasPagina from "./funciones/recetas/ListaRecetasPagina";
import DetalleRecetaPagina from "./funciones/recetas/DetalleRecetaPagina";
import CocinaPagina from "./funciones/cocina/CocinaPagina";

export function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<InicioPagina />} />
      <Route path="/recetas" element={<ListaRecetasPagina />} />
      <Route path="/recetas/:slug" element={<DetalleRecetaPagina />} />
      <Route path="/cocina/:slug" element={<CocinaPagina />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
