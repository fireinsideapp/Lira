# Lanza todo el entorno de desarrollo en Mac/Linux con un solo comando.
# Requiere: postgres y redis corriendo como servicios, cloudflared instalado.
# Uso: chmod +x dev.sh && ./dev.sh

set -e
trap 'kill 0' EXIT

(cd backend && uv run uvicorn app.main:app --reload --port 8000) &
(cd backend && uv run arq app.tareas.worker.ConfiguracionWorker) &
(cd frontend && npm run dev) &
cloudflared tunnel --url http://localhost:5173 &

wait
