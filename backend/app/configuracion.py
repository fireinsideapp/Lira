"""Lee las variables de entorno (backend/.env) con pydantic-settings."""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

RAIZ = Path(__file__).resolve().parents[1]  # carpeta backend/


class Configuracion(BaseSettings):
    model_config = SettingsConfigDict(env_file=RAIZ / ".env", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./lyra.db"

    # TTS: "openai", "elevenlabs" o vacio (el frontend usa la voz del navegador)
    proveedor_tts: str = ""
    openai_api_key: str = ""
    elevenlabs_api_key: str = ""
    id_voz: str = ""
    modelo_tts: str = ""
    velocidad_voz: float = 0.9

    carpeta_recetas: Path = RAIZ / "datos_iniciales" / "recetas"
    carpeta_cache_audio: Path = RAIZ / "cache_audio"


config = Configuracion()
