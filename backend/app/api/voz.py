"""POST /api/voz/hablar: texto -> audio MP3 (con cache). 501 si no hay TTS configurado."""
import httpx
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field

from app.servicios import servicio_voz

router = APIRouter(prefix="/voz", tags=["voz"])


class PeticionHablar(BaseModel):
    texto: str = Field(min_length=1, max_length=600)


@router.post("/hablar")
async def hablar(peticion: PeticionHablar):
    try:
        audio = await servicio_voz.hablar_con_cache(peticion.texto)
    except servicio_voz.TTSNoConfigurado:
        raise HTTPException(501, "TTS no configurado")
    except httpx.HTTPError:
        raise HTTPException(502, "El proveedor de voz fallo")
    return Response(content=audio, media_type="audio/mpeg")
