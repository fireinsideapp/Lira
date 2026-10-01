# backend/app/servicios/servicio_voz.py
"""Cliente TTS (ElevenLabs u OpenAI) con cache en disco."""
import hashlib

import httpx

from app.configuracion import config


class TTSNoConfigurado(Exception):
    """No hay proveedor de TTS listo; el frontend usa la voz del navegador."""


def _proveedor() -> str:
    if config.proveedor_tts == "elevenlabs" and config.elevenlabs_api_key and config.id_voz:
        return "elevenlabs"
    if config.proveedor_tts == "openai" and config.openai_api_key:
        return "openai"
    raise TTSNoConfigurado()


def _ruta_cache(texto: str) -> "Path":
    from pathlib import Path
    config.carpeta_cache_audio.mkdir(parents=True, exist_ok=True)
    nombre = hashlib.sha256(f"{config.proveedor_tts}|{config.id_voz}|{texto}".encode()).hexdigest()
    return config.carpeta_cache_audio / f"{nombre}.mp3"


async def _elevenlabs(texto: str) -> bytes:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{config.id_voz}?output_format=mp3_44100_128"
    headers = {"Accept": "audio/mpeg", "Content-Type": "application/json", "xi-api-key": config.elevenlabs_api_key}
    cuerpo = {
        "text": texto,
        "model_id": config.modelo_tts or "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
    }
    async with httpx.AsyncClient(timeout=30) as cliente:
        r = await cliente.post(url, json=cuerpo, headers=headers)
        r.raise_for_status()
        return r.content


async def _openai(texto: str) -> bytes:
    cuerpo = {
        "model": config.modelo_tts or "gpt-4o-mini-tts",
        "voice": config.id_voz or "coral",
        "input": texto,
        "response_format": "mp3",
    }
    headers = {"Authorization": f"Bearer {config.openai_api_key}"}
    async with httpx.AsyncClient(timeout=30) as cliente:
        r = await cliente.post("https://api.openai.com/v1/audio/speech", json=cuerpo, headers=headers)
        r.raise_for_status()
        return r.content


async def hablar_con_cache(texto: str) -> bytes:
    proveedor = _proveedor()
    ruta = _ruta_cache(texto)
    if ruta.exists():
        return ruta.read_bytes()

    audio = await (_elevenlabs(texto) if proveedor == "elevenlabs" else _openai(texto))
    ruta.write_bytes(audio)
    return audio