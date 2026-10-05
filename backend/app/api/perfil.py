"""GET/PUT /api/perfil: nombre y tratamiento (tu/usted) de la persona. Se guarda una vez en el onboarding."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.bd.sesion import obtener_sesion
from app.dependencias import asegurar_dispositivo, obtener_dispositivo_id
from app.esquemas.perfil import ActualizarPerfil, Perfil as PerfilEsquema
from app.servicios import servicio_memoria

router = APIRouter(prefix="/perfil", tags=["perfil"])


@router.get("", response_model=PerfilEsquema)
async def obtener(
    dispositivo_id: str = Depends(obtener_dispositivo_id),
    sesion: AsyncSession = Depends(obtener_sesion),
):
    await asegurar_dispositivo(dispositivo_id, sesion)
    perfil = await servicio_memoria.obtener_perfil(sesion, dispositivo_id)
    return perfil or PerfilEsquema()


@router.put("", response_model=PerfilEsquema)
async def actualizar(
    datos: ActualizarPerfil,
    dispositivo_id: str = Depends(obtener_dispositivo_id),
    sesion: AsyncSession = Depends(obtener_sesion),
):
    await asegurar_dispositivo(dispositivo_id, sesion)
    return await servicio_memoria.guardar_perfil(sesion, dispositivo_id, datos.nombre, datos.tratamiento)