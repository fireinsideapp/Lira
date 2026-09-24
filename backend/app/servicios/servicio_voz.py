"""Cliente TTS (OpenAI o ElevenLabs) con cache. Devuelve MP3."""
import httpx

from app.configuracion import config
from app.servicios import cache_audio

INSTRUCCIONES = (
    "Habla en español de México con voz cálida, pausada y clara, "
    "como una compañía amable para una persona mayor."
)


class TTSNoConfigurado(Exception):
    """No hay proveedor de TTS listo; el frontend usa la voz del navegador."""


def _proveedor() -> str:
    if config.proveedor_tts == "openai" and config.openai_api_key:
        return "openai"
    if config.proveedor_tts == "elevenlabs" and config.elevenlabs_api_key and config.id_voz:
        return "elevenlabs"
    raise TTSNoConfigurado()


async def _openai(texto: str) -> bytes:
    modelo = config.modelo_tts or "gpt-4o-mini-tts"
    cuerpo = {
        "model": modelo,
        "voice": config.id_voz or "coral",
        "input": texto,
        "response_format": "mp3",
    }
    if modelo.startswith("gpt-4o"):
        cuerpo["instructions"] = INSTRUCCIONES  # solo los modelos gpt-4o lo aceptan
    async with httpx.AsyncClient(timeout=30) as cliente:
        r = await cliente.post(
            "https://api.openai.com/v1/audio/speech",
            headers={"Authorization": f"Bearer {config.openai_api_key}"},
            json=cuerpo,
        )
        r.raise_for_status()
        return r.content


async def _elevenlabs(texto: str) -> bytes:
    cuerpo = {
        "text": texto,
        "model_id": config.modelo_tts or "eleven_flash_v2_5",
        "language_code": "es",
        "voice_settings": {"speed": config.velocidad_voz},
    }
    async with httpx.AsyncClient(timeout=30) as cliente:
        r = await cliente.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{config.id_voz}",
            headers={"xi-api-key": config.elevenlabs_api_key},
            json=cuerpo,
        )
        r.raise_for_status()
        return r.content


async def hablar_con_cache(texto: str) -> bytes:
    proveedor = _proveedor()
    k = cache_audio.clave(
        proveedor, config.id_voz, config.modelo_tts, str(config.velocidad_voz), texto
    )
    audio = cache_audio.leer(k)
    if audio:
        return audio
    audio = await (_openai(texto) if proveedor == "openai" else _elevenlabs(texto))
    cache_audio.guardar(k, audio)
    return audio
