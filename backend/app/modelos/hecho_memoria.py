"""Tabla hechos_memoria: cosas importantes que la persona menciono (familia, salud, planes),
para que Lyra pueda recordarlas y preguntar por ellas en sesiones futuras."""
from datetime import datetime, timezone

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.bd.base import Base


def _ahora_utc_sin_zona() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class HechoMemoria(Base):
    __tablename__ = "hechos_memoria"

    id: Mapped[int] = mapped_column(primary_key=True)
    dispositivo_id: Mapped[str] = mapped_column(ForeignKey("dispositivos.id"), index=True)
    texto: Mapped[str] = mapped_column(Text)
    mencionado: Mapped[bool] = mapped_column(Boolean, default=False)
    creado_en: Mapped[datetime] = mapped_column(default=_ahora_utc_sin_zona)