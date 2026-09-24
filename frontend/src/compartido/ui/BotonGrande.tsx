// Boton grande y de alto contraste (area de toque amplia) para adultos mayores.
import type { ButtonHTMLAttributes } from "react";

const estilos = {
  primario: "bg-blue-600 text-white active:bg-blue-800",
  secundario: "bg-slate-200 text-slate-900 active:bg-slate-300",
  peligro: "bg-red-600 text-white active:bg-red-800",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: keyof typeof estilos;
}

export function BotonGrande({ variante = "primario", className = "", ...resto }: Props) {
  return (
    <button
      {...resto}
      className={`flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-5 text-2xl font-extrabold shadow-md transition-colors ${estilos[variante]} ${className}`}
    />
  );
}
