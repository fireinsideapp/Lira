"""Tabla dispositivos: identidad anonima del usuario (un UUID generado en el navegador)."""
from datetime import datetime, timezone

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.bd.base import Base


def _ahora_utc_sin_zona() -> datetime:
    """Guardamos la hora en UTC pero sin el tzinfo adjunto, porque la columna es TIMESTAMP WITHOUT TIME ZONE."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Dispositivo(Base):
    __tablename__ = "dispositivos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    creado_en: Mapped[datetime] = mapped_column(default=_ahora_utc_sin_zona)