import os
import hashlib
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = os.getenv("ID_VOZ")
MODELO = os.getenv("MODELO_TTS", "eleven_multilingual_v2")

CARPETA_CACHE = "cache_audio"

class TTSNoConfigurado(Exception):
    """Excepción lanzada cuando faltan credenciales de ElevenLabs."""
    pass

async def hablar_con_cache(texto: str) -> bytes:
    """
    Verifica si el audio ya está en caché. Si no, lo solicita a ElevenLabs,
    lo guarda y retorna los bytes del archivo MP3.
    """
    if not API_KEY or not VOICE_ID:
        raise TTSNoConfigurado("Faltan las credenciales de ElevenLabs en el archivo .env")

    # Crear hash del texto para usarlo como nombre de archivo único en caché
    hash_texto = hashlib.md5(texto.encode("utf-8")).hexdigest()
    os.makedirs(CARPETA_CACHE, exist_ok=True)
    ruta_archivo = os.path.join(CARPETA_CACHE, f"{hash_texto}.mp3")

    # Si ya existe en caché, lo leemos directamente
    if os.path.exists(ruta_archivo):
        with open(ruta_archivo, "rb") as f:
            return f.read()

    # Si no está en caché, hacemos la petición a ElevenLabs
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128"

    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": API_KEY
    }

    data = {
        "text": texto,
        "model_id": MODELO,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }

    response = requests.post(url, json=data, headers=headers)

    if response.status_code == 200:
        audio_bytes = response.content
        # Guardar en caché
        with open(ruta_archivo, "wb") as f:
            f.write(audio_bytes)
        return audio_bytes
    else:
        print(f"--- ERROR ELEVENLABS --- Status: {response.status_code} | Respuesta: {response.text}")
        raise Exception(f"Error en ElevenLabs ({response.status_code}): {response.text}")