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
    except Exception as e:
        print(f"Error en endpoint /voz/hablar: {e}")
        raise HTTPException(502, f"El proveedor de voz falló: {str(e)}")
        
    return Response(content=audio, media_type="audio/mpeg")