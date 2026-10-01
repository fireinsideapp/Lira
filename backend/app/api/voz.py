from fastapi import APIRouter, HTTPException, Response, UploadFile, File
from pydantic import BaseModel, Field
import httpx
from app.servicios import servicio_voz, servicio_transcripcion

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
@router.post("/transcribir")
async def transcribir_audio(audio: UploadFile = File(...)):
    contenido = await audio.read()
    if not contenido:
        raise HTTPException(400, "Audio vacío")
    try:
        texto = await servicio_transcripcion.transcribir(contenido, audio.filename or "audio.webm")
    except httpx.HTTPError:
        raise HTTPException(502, "Falló la transcripción")
    return {"texto": texto}