"""Tabla mensajes_conversacion: historial corto de lo hablado, para darle contexto a Gemini."""
from datetime import datetime, timezone

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.bd.base import Base


def _ahora_utc_sin_zona() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class MensajeConversacion(Base):
    __tablename__ = "mensajes_conversacion"

    id: Mapped[int] = mapped_column(primary_key=True)
    dispositivo_id: Mapped[str] = mapped_column(ForeignKey("dispositivos.id"), index=True)
    rol: Mapped[str] = mapped_column(String(20))
    texto: Mapped[str] = mapped_column(Text)
    creado_en: Mapped[datetime] = mapped_column(default=_ahora_utc_sin_zona)