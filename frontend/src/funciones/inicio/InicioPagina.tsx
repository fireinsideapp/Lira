
import { HeartHandshake, Mic, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BotonGrande } from "../../compartido/ui/BotonGrande";
import { hablar } from "../../voz";
import { extraerNombre } from "../../voz/comandos/extraerNombre";
import { escucharNavegador, hayReconocimientoNavegador } from "../../voz/transcripcion/reconocimientoNavegador";
import { guardarNombre, obtenerPerfil } from "../perfil/api";

type Estado = "cargando" | "preguntando" | "escuchando" | "confirmando" | "listo";

export default function InicioPagina() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>("cargando");
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    obtenerPerfil()
      .then((perfil) => {
        if (perfil.nombre) {
          setNombre(perfil.nombre);
          setEstado("listo");
          hablar(`Hola de nuevo, ${perfil.nombre}. ¿Qué cocinamos hoy?`);
        } else {
          setEstado("preguntando");
        }
      })
      .catch(() => setEstado("preguntando")); // si falla la red, igual deja continuar
  }, []);

  const preguntarNombre = async () => {
    await hablar("Hola, soy Lyra. ¿Cómo te llamas?");
    if (!hayReconocimientoNavegador()) {
      // Sin reconocimiento de voz disponible, seguimos sin nombre; no bloquea el uso de la app.
      setEstado("listo");
      return;
    }
    setEstado("escuchando");
    try {
      const texto = await escucharNavegador();
      const detectado = extraerNombre(texto);
      if (detectado) {
        setEstado("confirmando");
        await guardarNombre(detectado);
        setNombre(detectado);
        await hablar(`Mucho gusto, ${detectado}. ¿Qué cocinamos hoy?`);
      } else {
        await hablar("No logré entender tu nombre, pero no hay problema, podemos seguir.");
      }
    } catch {
      await hablar("No te escuché bien, pero no hay problema, podemos seguir.");
    } finally {
      setEstado("listo");
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
      <HeartHandshake className="h-24 w-24 text-blue-600" aria-hidden />
      <h1 className="text-5xl font-extrabold text-slate-900">
        {nombre ? `Hola, ${nombre}` : "Hola, soy Lyra"}
      </h1>

      {estado === "cargando" && <p className="text-2xl text-slate-600">Un momento…</p>}

      {estado === "preguntando" && (
        <>
          <p className="text-2xl leading-snug text-slate-700">Toca el botón para que te salude.</p>
          <BotonGrande onClick={preguntarNombre}>
            <Mic className="h-8 w-8" /> Hablar con Lyra
          </BotonGrande>
        </>
      )}

      {estado === "escuchando" && (
        <p className="flex items-center gap-3 text-3xl font-bold text-blue-700">
          <Mic className="h-10 w-10 animate-pulse" aria-hidden /> Te escucho…
        </p>
      )}

      {estado === "confirmando" && <p className="text-2xl text-slate-600">Un momento…</p>}

      {estado === "listo" && (
        <>
          <p className="text-3xl leading-snug text-slate-700">Te acompaño en la cocina.</p>
          <BotonGrande onClick={() => navigate("/recetas")}>Ver recetas</BotonGrande>
        </>
      )}

      <p className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4 text-2xl font-bold text-slate-800">
        <Volume2 className="h-8 w-8 shrink-0 text-blue-600" aria-hidden />
        Sube el volumen de tu teléfono.
      </p>
    </div>
  );
}