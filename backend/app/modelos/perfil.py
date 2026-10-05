"""Tabla perfiles: datos basicos de la persona para personalizar a Lyra. Uno por dispositivo."""
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.bd.base import Base


class Perfil(Base):
    __tablename__ = "perfiles"

    dispositivo_id: Mapped[str] = mapped_column(ForeignKey("dispositivos.id"), primary_key=True)
    nombre: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tratamiento: Mapped[str] = mapped_column(String(10), default="tu")  # "tu" o "usted"