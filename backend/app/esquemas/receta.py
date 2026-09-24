"""Esquemas Pydantic de recetas. Deben coincidir con los JSON y con tipos.ts del frontend."""
from typing import Literal

from pydantic import BaseModel, ConfigDict


class Ingrediente(BaseModel):
    nombre: str
    cantidad: str = ""   # vacio si la receta no indica cantidad
    grupo: str = ""      # ej. "Salsa roja", "Para servir"


class Paso(BaseModel):
    orden: int
    texto: str
    temporizador_segundos: int | None = None
    temporizador_nombre: str | None = None
    nota_seguridad: str | None = None
    estufa: Literal["encendida", "apagar"] | None = None


class RecetaResumen(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    titulo: str
    descripcion: str
    porciones: int | None = None


class RecetaDetalle(RecetaResumen):
    ingredientes: list[Ingrediente]
    pasos: list[Paso]
