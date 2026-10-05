"""POST /api/conversacion: le pasa la pregunta libre del usuario a Gemini, con perfil + historial + receta."""
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.bd.sesion import obtener_sesion
from app.dependencias import asegurar_dispositivo, obtener_dispositivo_id
from app.servicios import servicio_llm, servicio_memoria

router = APIRouter(prefix="/conversacion", tags=["conversacion"])


class PeticionConversacion(BaseModel):
    receta_titulo: str
    paso_texto: str
    pregunta: str = Field(min_length=1, max_length=500)


@router.post("")
async def conversar(
    peticion: PeticionConversacion,
    dispositivo_id: str = Depends(obtener_dispositivo_id),
    sesion: AsyncSession = Depends(obtener_sesion),
):
    await asegurar_dispositivo(dispositivo_id, sesion)
    perfil = await servicio_memoria.obtener_perfil(sesion, dispositivo_id)
    historial = await servicio_memoria.obtener_historial_reciente(sesion, dispositivo_id)

    try:
        respuesta = await servicio_llm.preguntar(
            peticion.receta_titulo, peticion.paso_texto, peticion.pregunta, perfil, historial
        )
    except servicio_llm.LLMNoConfigurado:
        print("ERROR: Gemini no configurado (falta GEMINI_API_KEY)", flush=True)
        raise HTTPException(501, "LLM no configurado")
    except httpx.HTTPError as e:
        print("ERROR GEMINI (httpx):", repr(e), flush=True)
        if hasattr(e, "response") and e.response is not None:
            print("Respuesta de Google:", e.response.text, flush=True)
        raise HTTPException(502, "Falló la conversación")
    except Exception as e:
        print("ERROR INESPERADO:", repr(e), flush=True)
        raise HTTPException(502, "Error inesperado")

    await servicio_memoria.guardar_mensaje(sesion, dispositivo_id, "usuario", peticion.pregunta)
    await servicio_memoria.guardar_mensaje(sesion, dispositivo_id, "lyra", respuesta)

    return {"respuesta": respuesta}