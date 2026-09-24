import { Volume2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BotonGrande } from "../../compartido/ui/BotonGrande";
import { detener, hablar } from "../../voz";

export default function InicioPagina() {
  const navigate = useNavigate();

  // Presentación automática de Lyra en cuanto abre la app
  useEffect(() => {
    hablar("¡Hola! Soy Lyra, tu asistente personal de cocina. Asegúrate de tener el volumen encendido. Presiona el botón verde para comenzar.");
    return () => {
      detener(); // Detiene el audio si el usuario sale rápido de la pantalla
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center max-w-md mx-auto min-h-screen bg-white">
      <div className="flex items-center justify-center w-28 h-28 bg-[#8FB9A1]/20 rounded-full shadow-inner mb-2">
        <span className="text-6xl" role="img" aria-label="Olla de cocina">🍲</span>
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-700 uppercase tracking-wide">
          HOLA, SOY
        </h2>
        <h1 className="text-6xl sm:text-7xl font-extrabold text-slate-900 tracking-tight mt-1">
          LYRA
        </h1>
      </div>
      
      <p className="text-xl sm:text-2xl font-semibold text-slate-600 leading-relaxed">
        TU ASISTENTE PERSONAL
      </p>

      <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4 text-lg font-bold text-slate-800 w-full shadow-sm border border-slate-200">
        <Volume2 className="h-8 w-8 shrink-0 text-[#8FB9A1]" aria-hidden />
        <span className="text-left">Asegúrate de tener el volumen encendido.</span>
      </div>

      <div className="w-full mt-4">
        <BotonGrande 
          onClick={() => {
            detener();
            navigate("/recetas");
          }}
          style={{
            backgroundColor: "#8FB9A1",
            color: "#0F172A",
            fontSize: "20px",
            fontWeight: "bold",
            padding: "18px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(143, 185, 161, 0.4)",
            border: "none",
            width: "100%",
            cursor: "pointer"
          }}
        >
          COMENCEMOS
        </BotonGrande>
      </div>
    </div>
  );
}