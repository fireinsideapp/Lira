# Lyra

Asistente de cocina por voz para personas de la tercera edad. Funciona como compania: guia recetas paso a paso,
conversa, recuerda lo basico entre sesiones y pone temporizadores que avisan aunque el celular este bloqueado.

MVP: solo Android (Chrome, PWA instalada). Un mes de desarrollo.

## Estructura

- `frontend/`  PWA en React + Vite + TypeScript
- `backend/`   API en FastAPI + PostgreSQL + Redis (ARQ)
- `docs/`      decisiones y resultados de pruebas
- `dev.sh` / `dev.ps1`  arrancan todo en local

## Arranque rapido

1. Instalar: Python 3.12 + uv, Node LTS, PostgreSQL, Redis (en Windows: WSL2 o Upstash).
2. Copiar `.env.example` a `backend/.env` y llenar las claves.
3. Backend: `cd backend && uv sync && uv run alembic upgrade head && uv run python datos_iniciales/cargar_datos.py`
4. Frontend: `cd frontend && npm install`
5. Correr todo: `./dev.sh` (o `./dev.ps1` en Windows)
6. Abrir la URL HTTPS del tunel en el celular Android e instalar la PWA.

## Convenciones

- Nombres en espanol, sin acentos ni enie en archivos y carpetas.
- snake_case en Python, camelCase en TypeScript.
- Los hooks de React empiezan con `use`.
- Palabras tecnicas estandar en ingles (main.py, worker, Provider).
