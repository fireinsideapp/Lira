# backend/app/servicios/servicio_transcripcion.py
import httpx
from app.configuracion import config


async def transcribir(audio: bytes, nombre_archivo: str) -> str:
    async with httpx.AsyncClient(timeout=30) as cliente:
        r = await cliente.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {config.openai_api_key}"},
            files={"file": (nombre_archivo, audio, "audio/webm")},
            data={"model": "whisper-1", "language": "es"},
        )
        r.raise_for_status()
        return r.json()["text"].strip()