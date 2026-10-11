import { HeartHandshake, Mic, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BotonGrande } from "../../compartido/ui/BotonGrande";
import { hablar } from "../../voz";
import { extraerNombre } from "../../voz/comandos/extraerNombre";
import { escucharNavegador, hayReconocimientoNavegador } from "../../voz/transcripcion/reconocimientoNavegador";
import { guardarNombre, obtenerPerfil } from "../perfil/api";

type Estado = "cargando" | "preguntando" | "escuchando" | "confirmando" | "listo";

// Convierte el error del reconocimiento en un mensaje claro y hablado.
function mensajeDeError(e: unknown): string {
  const err = e as { error?: string; message?: string } | undefined;
  const codigo = String(err?.error ?? err?.message ?? e ?? "");
  if (/not-allowed|service-not-allowed|permission/i.test(codigo)) {
    return "No tengo permiso para usar el micrófono, pero no hay problema, podemos seguir. Puedes activarlo en la configuración del navegador.";
  }
  if (/network/i.test(codigo)) {
    return "No pude escucharte porque falla el internet, pero no hay problema, podemos seguir.";
  }
  return "No te escuché bien, pero no hay problema, podemos seguir.";
}

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
      await hablar("Tu navegador no permite usar el micrófono, pero puedes ver las recetas con el botón.");
      setEstado("listo");
      return;
    }

    setEstado("escuchando");
    let texto = "";
    try {
      texto = await escucharNavegador();
    } catch (e) {
      console.error("Error de reconocimiento:", e);
      setEstado("listo");
      await hablar(mensajeDeError(e));
      return;
    }

    const detectado = extraerNombre(texto);
    if (!detectado) {
      setEstado("listo");
      await hablar("No logré entender tu nombre, pero no hay problema, podemos seguir.");
      return;
    }

    setEstado("confirmando");
    try {
      await guardarNombre(detectado);
    } catch {
      // Falló guardar en el servidor: igual usamos el nombre en esta sesión.
      setNombre(detectado);
      setEstado("listo");
      await hablar(`Mucho gusto, ${detectado}. No pude guardar tu nombre ahora, pero podemos seguir.`);
      return;
    }
    setNombre(detectado);
    setEstado("listo");
    await hablar(`Mucho gusto, ${detectado}. ¿Qué cocinamos hoy?`);
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