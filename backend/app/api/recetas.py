"""GET /api/recetas y GET /api/recetas/{slug}."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.bd.sesion import obtener_sesion
from app.esquemas.receta import RecetaDetalle, RecetaResumen
from app.servicios import servicio_recetas

router = APIRouter(prefix="/recetas", tags=["recetas"])


@router.get("", response_model=list[RecetaResumen])
async def listar(sesion: AsyncSession = Depends(obtener_sesion)):
    return await servicio_recetas.listar(sesion)


@router.get("/{slug}", response_model=RecetaDetalle)
async def detalle(slug: str, sesion: AsyncSession = Depends(obtener_sesion)):
    receta = await servicio_recetas.obtener(sesion, slug)
    if receta is None:
        raise HTTPException(404, "Receta no encontrada")
    return receta
