# backend/app/api/conversacion.py
"""POST /api/conversacion: le pasa la pregunta libre del usuario a Gemini, con el contexto de la receta."""
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.servicios import servicio_llm

router = APIRouter(prefix="/conversacion", tags=["conversacion"])


class PeticionConversacion(BaseModel):
    receta_titulo: str
    paso_texto: str
    pregunta: str = Field(min_length=1, max_length=500)


@router.post("")
async def conversar(peticion: PeticionConversacion):
    try:
        respuesta = await servicio_llm.preguntar(
            peticion.receta_titulo, peticion.paso_texto, peticion.pregunta
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
    return {"respuesta": respuesta}