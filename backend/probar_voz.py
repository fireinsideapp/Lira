import os
import requests
from dotenv import load_dotenv

def probar_elevenlabs():
    # Cargar las variables del archivo .env justo al iniciar la función
    load_dotenv()

    api_key = os.getenv("ELEVENLABS_API_KEY")
    voice_id = os.getenv("ID_VOZ")
    modelo = os.getenv("MODELO_TTS", "eleven_multilingual_v2")

    if not api_key or not voice_id:
        print("❌ Error: Faltan 'ELEVENLABS_API_KEY' o 'ID_VOZ' en tu archivo .env")
        print(f"Valor leído API_KEY: {repr(api_key)}")
        print(f"Valor leído VOICE_ID: {repr(voice_id)}")
        return

    print(f"Generando audio con ElevenLabs (Voz ID: {voice_id})...")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }

    data = {
        "text": "Hola, soy Lyra, tu asistente culinaria. ¿Qué se nos antoja cocinar hoy?",
        "model_id": modelo,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }

    try:
        response = requests.post(url, json=data, headers=headers)

        if response.status_code == 200:
            os.makedirs("cache_audio", exist_ok=True)
            ruta_salida = "cache_audio/test_audio_elevenlabs.mp3"
            
            with open(ruta_salida, "wb") as f:
                f.write(response.content)
            
            print(f"¡Audio generado con éxito y guardado en: {ruta_salida}!")
        else:
            print(f"❌ Error en la API de ElevenLabs ({response.status_code}): {response.text}")
            
    except Exception as e:
        print(f"❌ Ocurrió un error de conexión: {e}")

if __name__ == "__main__":
    probar_elevenlabs()