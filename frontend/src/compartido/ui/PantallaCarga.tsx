// Estado de carga o error, con boton grande para reintentar.
import { BotonGrande } from "./BotonGrande";

export function PantallaCarga({ error, alReintentar }: { error: boolean; alReintentar: () => void }) {
  if (!error) {
    return <p className="p-8 text-center text-3xl font-bold text-slate-700">Cargando…</p>;
  }
  return (
    <div className="flex flex-col gap-6 p-8">
      <p className="text-center text-3xl font-bold text-slate-800">No pude cargar la información.</p>
      <BotonGrande onClick={alReintentar}>Intentar de nuevo</BotonGrande>
    </div>
  );
}
