// Pantalla de bienvenida. Al tocar "Comenzar" el navegador queda con permiso para reproducir audio.
// Semanas 2-3: aqui tambien se pediran microfono y notificaciones.
import { HeartHandshake, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BotonGrande } from "../../compartido/ui/BotonGrande";

export default function InicioPagina() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
      <HeartHandshake className="h-24 w-24 text-blue-600" aria-hidden />
      <h1 className="text-5xl font-extrabold text-slate-900">Hola, soy Lyra</h1>
      <p className="text-3xl leading-snug text-slate-700">
        Te acompaño en la cocina y te guío paso a paso.
      </p>
      <BotonGrande onClick={() => navigate("/recetas")}>Comenzar</BotonGrande>
      <p className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4 text-2xl font-bold text-slate-800">
        <Volume2 className="h-8 w-8 shrink-0 text-blue-600" aria-hidden />
        Sube el volumen de tu teléfono.
      </p>
    </div>
  );
}
