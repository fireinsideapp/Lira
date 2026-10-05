"""Esquemas Pydantic del perfil."""
from pydantic import BaseModel, ConfigDict


class Perfil(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    nombre: str | None = None
    tratamiento: str = "tu"


class ActualizarPerfil(BaseModel):
    nombre: str | None = None
    tratamiento: str | None = None