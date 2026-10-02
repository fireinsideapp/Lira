# backend/app/servicios/servicio_llm.py
"""Cliente de Gemini (Google AI Studio) para la conversacion libre de Lyra.
Se usa SOLO cuando interpretarComando no reconoce la frase como un comando (siguiente, repite, temporizador).
"""
import httpx

from app.configuracion import config

PERSONALIDAD = """Eres Lyra, una asistente de cocina por voz para personas mayores. Tu tono es calido, paciente y breve.

Reglas que SIEMPRE debes seguir:
- Responde en maximo 2 o 3 frases cortas, pensadas para leerse en voz alta.
- NUNCA inventes tiempos de coccion, temperaturas ni cantidades que no esten en la receta que te doy.
- Si la pregunta no tiene relacion con la receta o la cocina, redirige con amabilidad hacia la receta.
- Si la persona menciona algo preocupante de salud, una caida, o se siente mal, no des consejo medico:
  sugiere con calidez que llame a un familiar o a servicios de emergencia.
- No des consejos de seguridad alimentaria que no esten en la receta; si no sabes, dilo con honestidad.
"""


class LLMNoConfigurado(Exception):
    """No hay clave de Gemini configurada."""


async def preguntar(receta_titulo: str, paso_texto: str, pregunta_usuario: str) -> str:
    if not config.gemini_api_key:
        raise LLMNoConfigurado()

    contexto = (
        f"Receta actual: {receta_titulo}\n"
        f"Paso en el que va la persona ahora mismo: {paso_texto}\n\n"
        f"La persona dijo: \"{pregunta_usuario}\"\n\n"
        "Respondele como Lyra, breve y calida."
    )

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{config.modelo_llm}:generateContent?key={config.gemini_api_key}"
    )
    cuerpo = {
        "system_instruction": {"parts": [{"text": PERSONALIDAD}]},
        "contents": [{"role": "user", "parts": [{"text": contexto}]}],
        "generationConfig": {"maxOutputTokens": 150, "temperature": 0.6},
    }

    async with httpx.AsyncClient(timeout=20) as cliente:
        r = await cliente.post(url, json=cuerpo)
        r.raise_for_status()
        datos = r.json()

    try:
        return datos["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError):
        return "No supe qué responder a eso. ¿Seguimos con la receta?"