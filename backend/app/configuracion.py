"""Lee las variables de entorno (backend/.env) con pydantic-settings."""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

RAIZ = Path(__file__).resolve().parents[1]  # carpeta backend/


class Configuracion(BaseSettings):
    model_config = SettingsConfigDict(env_file=RAIZ / ".env", extra="ignore")
    database_url: str = "postgresql+asyncpg://postgres:root@127.0.0.1:5432/Lyra"

    # TTS: "openai", "elevenlabs" o vacio (el frontend usa la voz del navegador)
    proveedor_tts: str = ""
    openai_api_key: str = ""
    elevenlabs_api_key: str = ""
    id_voz: str = ""
    modelo_tts: str = ""
    velocidad_voz: float = 0.9
    gemini_api_key: str = ""
    modelo_llm: str = "gemini-3.1-flash-lite"  # alias: siempre apunta al Flash vigente de Google

    carpeta_recetas: Path = RAIZ / "datos_iniciales" / "recetas"
    carpeta_cache_audio: Path = RAIZ / "cache_audio"

    @property
    def database_url_normalizada(self) -> str:
        """Railway entrega postgres:// ; SQLAlchemy async necesita postgresql+asyncpg://"""
        url = self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

config = Configuracion()
