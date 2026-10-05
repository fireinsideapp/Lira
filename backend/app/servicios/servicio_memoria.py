"""Perfil e historial corto de conversacion, usados para personalizar las respuestas de Lyra."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modelos.mensaje import MensajeConversacion
from app.modelos.perfil import Perfil

MAXIMO_MENSAJES_CONTEXTO = 6  # ~3 intercambios; suficiente para dar continuidad sin gastar de mas en tokens


async def obtener_perfil(sesion: AsyncSession, dispositivo_id: str) -> Perfil | None:
    return await sesion.get(Perfil, dispositivo_id)


async def guardar_perfil(sesion: AsyncSession, dispositivo_id: str, nombre: str | None, tratamiento: str | None) -> Perfil:
    perfil = await sesion.get(Perfil, dispositivo_id)
    if perfil is None:
        perfil = Perfil(dispositivo_id=dispositivo_id, tratamiento=tratamiento or "tu")
        sesion.add(perfil)
    if nombre is not None:
        perfil.nombre = nombre
    if tratamiento is not None:
        perfil.tratamiento = tratamiento
    await sesion.commit()
    await sesion.refresh(perfil)
    return perfil


async def obtener_historial_reciente(sesion: AsyncSession, dispositivo_id: str) -> list[MensajeConversacion]:
    resultado = await sesion.execute(
        select(MensajeConversacion)
        .where(MensajeConversacion.dispositivo_id == dispositivo_id)
        .order_by(MensajeConversacion.id.desc())
        .limit(MAXIMO_MENSAJES_CONTEXTO)
    )
    return list(reversed(resultado.scalars().all()))


async def guardar_mensaje(sesion: AsyncSession, dispositivo_id: str, rol: str, texto: str) -> None:
    sesion.add(MensajeConversacion(dispositivo_id=dispositivo_id, rol=rol, texto=texto))
    await sesion.commit()