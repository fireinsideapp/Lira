"""Dependencias de FastAPI compartidas por los endpoints."""
from fastapi import Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.modelos.dispositivo import Dispositivo


async def obtener_dispositivo_id(x_dispositivo_id: str = Header(...)) -> str:
    """Lee el ID anonimo del dispositivo desde la cabecera X-Dispositivo-Id."""
    return x_dispositivo_id


async def asegurar_dispositivo(dispositivo_id: str, sesion: AsyncSession) -> None:
    """Crea el registro del dispositivo en la BD la primera vez que se ve ese ID."""
    existente = await sesion.get(Dispositivo, dispositivo_id)
    if existente is None:
        sesion.add(Dispositivo(id=dispositivo_id))
        await sesion.commit()