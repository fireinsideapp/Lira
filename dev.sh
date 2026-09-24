# Fase 1: backend + frontend + tunel HTTPS (sin worker todavia).
# Requiere: postgres corriendo (o SQLite en .env) y cloudflared instalado.
# Uso: chmod +x dev.sh && ./dev.sh
set -e
trap 'kill 0' EXIT

(cd backend && uv run uvicorn app.main:app --reload --port 8000) &
(cd frontend && npm run dev) &
cloudflared tunnel --url http://localhost:5173 &

wait
