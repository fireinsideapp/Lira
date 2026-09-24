// Componente raiz: contenedor de una sola columna pensado para celular.
import { Rutas } from "./rutas";

export default function App() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-white">
      <Rutas />
    </div>
  );
}
