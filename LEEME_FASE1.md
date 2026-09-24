# Lyra – Fase 1 (recetas + cocina guiada por voz)

Estos archivos se copian ENCIMA de tu estructura `lyra/` (reemplazan los del zip anterior).

## Borra estos archivos del zip anterior
- backend/datos_iniciales/recetas/frijoles-de-la-olla.json
- backend/datos_iniciales/recetas/arroz-rojo.json
(el backend carga TODOS los .json de esa carpeta)

## Arranque
1. Base de datos: `createdb lyra` (Postgres), o usa SQLite en backend/.env:
   DATABASE_URL=sqlite+aiosqlite:///./lyra.db
2. cp .env.example backend/.env   (y ajusta DATABASE_URL; el TTS puede quedar vacio)
3. Backend:  cd backend && uv sync && uv run uvicorn app.main:app --reload --port 8000
   (crea las tablas y carga las recetas solo al arrancar)
4. Frontend: cd frontend && npm install && npm run dev
5. Celular: ./dev.sh (o dev.ps1) levanta todo + tunel HTTPS. Abre la URL del tunel en Chrome Android.
   Para probar la INSTALACION de la PWA: npm run build && npm run preview y tunel al puerto 4173.

## Voz
- Sin claves: Lyra usa la voz del navegador (es-MX).
- Con TTS: en backend/.env pon PROVEEDOR_TTS=openai + OPENAI_API_KEY (ID_VOZ opcional, ej. coral),
  o PROVEEDOR_TTS=elevenlabs + ELEVENLABS_API_KEY + ID_VOZ. Cada frase se guarda en backend/cache_audio/.

## Alcance de la fase 1
Incluido: lista de recetas, detalle con ingredientes, cocina paso a paso con voz, alerta de estufa,
temporizadores locales (avisan con la app abierta), Wake Lock, PWA instalable.
Pendiente: microfono/palabra clave (semana 2), estado en servidor (semana 2), Web Push (semana 3), LLM (semana 3), memoria (semana 4).
