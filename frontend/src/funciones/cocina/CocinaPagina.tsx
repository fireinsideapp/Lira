// frontend/src/funciones/cocina/CocinaPagina.tsx
import { ArrowLeft, ChefHat, Ear, EarOff, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBloqueoPantalla } from "../../compartido/hooks/useBloqueoPantalla";
import { BotonGrande } from "../../compartido/ui/BotonGrande";
import { PantallaCarga } from "../../compartido/ui/PantallaCarga";
import { detener, hablar } from "../../voz";
import { useReceta } from "../recetas/api";
import type { Receta } from "../recetas/tipos";
import { InsigniaTemporizador } from "../temporizadores/InsigniaTemporizador";
import { AlertaEstufa } from "./componentes/AlertaEstufa";
import { ControlesPaso } from "./componentes/ControlesPaso";
import { useEscuchaAutomatica } from "./useEscuchaAutomatica";
import { useSesionCocina } from "./useSesionCocina";
import { VistaPaso } from "./VistaPaso";

// Respuestas posibles cuando Lyra pregunta "¿Empezamos a cocinar?" en la introducción.
const normalizar = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¿?¡!.,]/g, "").trim();
const AFIRMATIVO = /\b(si|claro|empezar|empecemos|empieza|empezamos|comenzar|comencemos|comienza|vamos|dale|listo|ya|ok|vale|adelante|siguiente)\b/;
const NEGATIVO = /^(no|espera|todavia no|aun no|ahorita no)\b/;
const REPETIR = /\b(repite|repitelo|otra vez|de nuevo|que dijiste)\b/;

export default function CocinaPagina() {
  const { slug = "" } = useParams();
  const { datos: receta, error, reintentar } = useReceta(slug);
  if (!receta) return <PantallaCarga error={error} alReintentar={reintentar} />;
  return <Cocina receta={receta} />;
}

function Cocina({ receta }: { receta: Receta }) {
  const navigate = useNavigate();
  const sesion = useSesionCocina(receta);
  const { paso, iniciada, terminada } = sesion;
  const [ultimoEscuchado, setUltimoEscuchado] = useState("");
  const [escuchaAuto, setEscuchaAuto] = useState(true); // el usuario puede pausarla con el botón
  const yaLeidaRef = useRef(false); // evita releer si React re-renderiza el mismo slug

  useBloqueoPantalla(iniciada && !terminada);

  const leerIntroduccion = () => {
    detener();
    const ingredientesTexto = receta.ingredientes
      ?.map((i) => [i.cantidad, i.nombre].filter(Boolean).join(" "))
      .filter(Boolean)
      .join(", ");

    const mensaje = ingredientesTexto
      ? `Receta de ${receta.titulo}. ${receta.descripcion}. Los ingredientes necesarios son: ${ingredientesTexto}. ¿Empezamos a cocinar?`
      : `Receta de ${receta.titulo}. ${receta.descripcion}. ¿Empezamos a cocinar?`;

    return hablar(mensaje);
  };

  // En la introducción, la voz sirve para decir "sí / empezar" o pedir que repita.
  const procesarIntro = async (texto: string) => {
    const t = normalizar(texto);
    if (REPETIR.test(t)) return leerIntroduccion();
    if (NEGATIVO.test(t)) return hablar("Está bien, avísame cuando estés listo y di empezar.");
    if (t.split(" ").length <= 4 && AFIRMATIVO.test(t)) {
      detener();
      sesion.iniciar(); // el paso 1 lo lee useSesionCocina
      return;
    }
    return hablar("Cuando estés listo, di empezar.");
  };

  const procesarVoz = (texto: string) => (iniciada ? sesion.procesarTexto(texto) : procesarIntro(texto));

  // Escucha automática desde la introducción hasta el final de la receta.
  useEscuchaAutomatica({
    activa: escuchaAuto && !terminada,
    procesarTexto: procesarVoz,
    alTranscribir: setUltimoEscuchado,
    alDetenerse: () => setEscuchaAuto(false),
  });

  const alternarEscucha = () => {
    if (escuchaAuto) {
      setEscuchaAuto(false);
      hablar("Listo, ya no te escucho solo. Toca el micrófono cuando quieras hablarme.");
    } else {
      setEscuchaAuto(true);
      hablar("Listo, vuelvo a escucharte.");
    }
  };

  // Lectura automatica: solo una vez, solo mientras seguimos en la intro (!iniciada).
  useEffect(() => {
    if (!iniciada && !yaLeidaRef.current) {
      yaLeidaRef.current = true;
      leerIntroduccion();
    }
    return () => {
      if (!iniciada) detener();
    };
  }, [iniciada]);

  const salir = () => {
    if (!iniciada || terminada || window.confirm("¿Quieres salir de la receta?")) {
      detener();
      navigate("/recetas");
    }
  };

  return (
    <div className="flex flex-1 flex-col max-w-md mx-auto w-full bg-white min-h-screen relative pb-10">
      <header className="flex items-center justify-between p-5 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={salir}
            aria-label="Salir de la receta"
            className="rounded-2xl bg-[#8FB9A1]/20 p-3 text-slate-900 active:bg-[#8FB9A1]/40 transition-colors"
          >
            <ArrowLeft className="h-8 w-8" />
          </button>
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900 tracking-tight">{receta.titulo}</h1>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-5 p-5">
        {ultimoEscuchado && !terminada && (
          <p className="rounded-2xl bg-slate-100 p-3 text-lg text-slate-600">Escuché: "{ultimoEscuchado}"</p>
        )}

        {!iniciada && (
          <>
            <button
              onClick={leerIntroduccion}
              className="rounded-3xl border-4 border-[#8FB9A1]/30 bg-white p-6 text-center shadow-md flex flex-col gap-4 w-full active:bg-[#8FB9A1]/10"
            >
              <ChefHat className="mx-auto h-16 w-16 text-[#8FB9A1]" aria-hidden />

              <p className="text-2xl font-bold leading-snug text-slate-900">{receta.descripcion}</p>

              {receta.ingredientes && receta.ingredientes.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left">
                  <p className="text-xl font-extrabold text-slate-900 mb-2 text-center">Ingredientes principales:</p>
                  <ul className="list-disc list-inside text-lg font-semibold text-slate-700 space-y-1">
                    {receta.ingredientes.map((ing, index) => (
                      <li key={index}>
                        {ing.cantidad} {ing.nombre}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-2 flex items-center justify-center gap-3 text-xl font-semibold text-slate-700">
                <Volume2 className="h-7 w-7 shrink-0 text-[#8FB9A1]" aria-hidden /> Toca aquí para volver a escucharla
              </p>
            </button>

            <BotonGrande
              onClick={() => {
                detener();
                sesion.iniciar();
              }}
            >
              Empezar a cocinar
            </BotonGrande>
          </>
        )}

        {paso && (
          <>
            <VistaPaso paso={paso} total={sesion.total} />
            {paso.estufa && <AlertaEstufa modo={paso.estufa} />}
          </>
        )}

        {terminada && (
          <div className="rounded-3xl border-4 border-green-200 bg-green-50 p-6 text-center shadow-sm">
            <p className="text-4xl font-extrabold text-green-900">¡Terminamos!</p>
            <p className="mt-3 text-3xl font-bold text-green-900">Buen provecho 🍽️</p>
          </div>
        )}

        {sesion.temporizadores.map((t) => (
          <InsigniaTemporizador
            key={t.id}
            nombre={t.nombre}
            restante={t.restante}
            sonando={t.sonando}
            alQuitar={() => sesion.quitarTemporizador(t.id)}
          />
        ))}

        {!terminada && (
          <button
            onClick={alternarEscucha}
            className={`flex items-center justify-center gap-3 rounded-2xl border-4 p-4 text-xl font-extrabold active:scale-95 ${
              escuchaAuto
                ? "border-[#8FB9A1] bg-[#8FB9A1]/20 text-slate-900"
                : "border-slate-300 bg-slate-100 text-slate-700"
            }`}
          >
            {escuchaAuto ? (
              <>
                <Ear className="h-7 w-7" aria-hidden /> Te escucho solo · Toca para pausar
              </>
            ) : (
              <>
                <EarOff className="h-7 w-7" aria-hidden /> Escucha pausada · Toca para activar
              </>
            )}
          </button>
        )}

        {terminada && <BotonGrande onClick={() => navigate("/recetas")}>Volver a las recetas</BotonGrande>}
      </main>

      {iniciada && !terminada && (
        <ControlesPaso
          esUltimo={sesion.esUltimo}
          alAnterior={sesion.anterior}
          alSiguiente={sesion.siguiente}
          alRepetir={sesion.repetir}
          procesarTexto={sesion.procesarTexto}
          alTranscribir={setUltimoEscuchado}
        />
      )}
    </div>
  );
}