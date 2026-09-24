"""Consultar recetas y cargarlas desde los JSON de datos_iniciales/recetas."""
import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.esquemas.receta import RecetaDetalle
from app.modelos.receta import Receta


async def listar(sesion: AsyncSession) -> list[Receta]:
    resultado = await sesion.execute(select(Receta).order_by(Receta.id))
    return list(resultado.scalars())


async def obtener(sesion: AsyncSession, slug: str) -> Receta | None:
    resultado = await sesion.execute(select(Receta).where(Receta.slug == slug))
    return resultado.scalar_one_or_none()


async def sembrar(sesion: AsyncSession, carpeta: Path) -> int:
    """Inserta o actualiza (por slug) cada JSON de la carpeta. Devuelve cuantas recetas cargo."""
    cargadas = 0
    for archivo in sorted(carpeta.glob("*.json")):
        datos = RecetaDetalle.model_validate(json.loads(archivo.read_text(encoding="utf-8")))
        valores = datos.model_dump()
        existente = await obtener(sesion, datos.slug)
        if existente:
            for clave, valor in valores.items():
                setattr(existente, clave, valor)
        else:
            sesion.add(Receta(**valores))
        cargadas += 1
    await sesion.commit()
    return cargadas
