"""Tabla recetas. Ingredientes y pasos se guardan como JSON (JSONB en Postgres)."""
from sqlalchemy import JSON, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.bd.base import Base

JsonFlexible = JSON().with_variant(JSONB(), "postgresql")


class Receta(Base):
    __tablename__ = "recetas"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    titulo: Mapped[str] = mapped_column(String(200))
    descripcion: Mapped[str] = mapped_column(Text)
    porciones: Mapped[int | None] = mapped_column(nullable=True)
    ingredientes: Mapped[list] = mapped_column(JsonFlexible)
    pasos: Mapped[list] = mapped_column(JsonFlexible)
