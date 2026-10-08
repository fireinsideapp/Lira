"""Cliente de Gemini (Google AI Studio) para la conversacion libre de Lyra.
Se usa SOLO cuando interpretarComando no reconoce la frase como un comando.

Cada llamada devuelve, en una sola respuesta estructurada (JSON), dos cosas:
- "respuesta": lo que Lyra debe decir en voz alta.
- "hecho_nuevo": si la persona menciono algo personal que valga la pena recordar, una frase corta
  en tercera persona para guardar; si no hay nada que recordar, null.
Esto evita una segunda llamada al modelo solo para extraer memoria.
"""
import json
import httpx

from app.configuracion import config
from app.modelos.hecho_memoria import HechoMemoria
from app.modelos.mensaje import MensajeConversacion
from app.modelos.perfil import Perfil

PERSONALIDAD = """Eres Lyra, una compañera de cocina por voz para personas mayores, no un asistente tipo Alexa.
Tu objetivo no es solo dar instrucciones: es acompañar. La cocina es mexicana en su mayoría (chilaquiles,
frijoles, salsas, guisos tradicionales), así que tus recomendaciones y sustituciones de ingredientes deben
tener sentido dentro de la cocina mexicana (por ejemplo, prioriza chiles, tortillas de maíz, técnicas y
sabores tradicionales antes que alternativas extranjeras, salvo que la persona pida explícitamente otra cosa).

Cómo hablas:
- Tus respuestas tienen entre 3 y 5 frases, con calidez real, no respuestas de una sola palabra o puro sí/no.
  No te extiendas más de eso: esto se lee en voz alta, no es un chat de texto.
- Si la persona te platica algo personal (su familia, cómo se siente, sus planes), no lo ignores ni lo
  conviertas en un dato frío: respóndele con interés genuino, como lo haría alguien que la quiere, y si
  tiene sentido, haz una pregunta breve y natural para seguir la conversación (sin interrogarla ni insistir
  si ella no quiere profundizar).
- Si ya sabes algo de ella por conversaciones anteriores (lo que te paso como "cosas que recuerdas de ella"),
  puedes retomarlo con naturalidad cuando venga al caso, por ejemplo preguntando cómo le fue con algo que
  había mencionado antes.

Reglas que SIEMPRE debes seguir, sin excepción:
- NUNCA inventes tiempos de coccion, temperaturas ni cantidades que no esten en la receta que te doy.
- Si la pregunta no tiene relacion con la receta, la cocina o una charla normal, redirige con amabilidad.
- Si la persona menciona algo preocupante de salud, una caida, o se siente mal, no des consejo medico:
  sugiere con calidez que llame a un familiar o a servicios de emergencia.
- No des consejos de seguridad alimentaria que no esten en la receta; si no sabes, dilo con honestidad.

Formato de tu respuesta (OBLIGATORIO): responde solo con el JSON pedido, nada de texto fuera de el.
- "respuesta": lo que vas a decir en voz alta (3 a 5 frases, cálidas, nunca solo si/no).
- "hecho_nuevo": si la persona compartio algo personal que valga la pena recordar para el futuro
  (visitas familiares, planes, gustos, salud, estado de animo notable), escribelo como una frase corta
  en tercera persona (ej. "Su hijo la visita mañana por la tarde."). Si no hay nada que recordar, usa null.
"""


class LLMNoConfigurado(Exception):
    """No hay clave de Gemini configurada."""


def _tratamiento_texto(tratamiento: str) -> str:
    return "de usted" if tratamiento == "usted" else "de tu"


def _url() -> str:
    return (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{config.modelo_llm}:generateContent?key={config.gemini_api_key}"
    )


ESQUEMA_RESPUESTA = {
    "type": "OBJECT",
    "properties": {
        "respuesta": {"type": "STRING"},
        "hecho_nuevo": {"type": "STRING", "nullable": True},
    },
    "required": ["respuesta"],
}


async def preguntar(
    receta_titulo: str,
    paso_texto: str,
    pregunta_usuario: str,
    perfil: Perfil | None = None,
    historial: list[MensajeConversacion] | None = None,
    hechos: list[HechoMemoria] | None = None,
) -> tuple[str, str | None]:
    """Devuelve (respuesta_hablada, hecho_nuevo_o_None)."""
    if not config.gemini_api_key:
        raise LLMNoConfigurado()

    partes_contexto = [PERSONALIDAD]

    if perfil and perfil.nombre:
        partes_contexto.append(
            f"La persona se llama {perfil.nombre} y prefieres hablarle {_tratamiento_texto(perfil.tratamiento)}."
        )

    if hechos:
        lineas = [f"- {h.texto}" for h in hechos]
        partes_contexto.append("Cosas que recuerdas de ella, de conversaciones anteriores:\n" + "\n".join(lineas))

    if historial:
        lineas = [f"{'Persona' if m.rol == 'usuario' else 'Lyra'}: {m.texto}" for m in historial]
        partes_contexto.append("Esto es lo último que hablaron en esta sesión:\n" + "\n".join(lineas))

    partes_contexto.append(
        f"Receta actual: {receta_titulo}\n"
        f"Paso en el que va la persona ahora mismo: {paso_texto}\n\n"
        f"La persona dijo ahora: \"{pregunta_usuario}\"\n\n"
        "Responde con el JSON pedido."
    )
    contexto = "\n\n".join(partes_contexto)

    cuerpo = {
        "contents": [{"role": "user", "parts": [{"text": contexto}]}],
        "generationConfig": {
            "maxOutputTokens": 250,
            "temperature": 0.7,
            "responseMimeType": "application/json",
            "responseSchema": ESQUEMA_RESPUESTA,
        },
    }

    async with httpx.AsyncClient(timeout=20) as cliente:
        r = await cliente.post(_url(), json=cuerpo)
        r.raise_for_status()
        datos = r.json()

    try:
        texto_json = datos["candidates"][0]["content"]["parts"][0]["text"]
        analizado = json.loads(texto_json)
        respuesta = analizado.get("respuesta", "").strip()
        hecho_nuevo = analizado.get("hecho_nuevo")
        hecho_nuevo = hecho_nuevo.strip() if isinstance(hecho_nuevo, str) and hecho_nuevo.strip() else None
        if not respuesta:
            respuesta = "No supe qué responder a eso. ¿Seguimos con la receta?"
        return respuesta, hecho_nuevo
    except (KeyError, IndexError, ValueError):
        return "No supe qué responder a eso. ¿Seguimos con la receta?", None