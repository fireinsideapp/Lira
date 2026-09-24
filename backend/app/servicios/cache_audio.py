"""Cache de audio en disco. Nombre del archivo = hash(proveedor + voz + modelo + velocidad + texto)."""
import hashlib

from app.configuracion import config


def clave(*partes: str) -> str:
    return hashlib.sha256("|".join(partes).encode("utf-8")).hexdigest()


def _ruta(k: str):
    return config.carpeta_cache_audio / f"{k}.mp3"


def leer(k: str) -> bytes | None:
    ruta = _ruta(k)
    return ruta.read_bytes() if ruta.exists() else None


def guardar(k: str, audio: bytes) -> None:
    config.carpeta_cache_audio.mkdir(parents=True, exist_ok=True)
    _ruta(k).write_bytes(audio)
