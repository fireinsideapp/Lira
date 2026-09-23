# Lo mismo que dev.sh pero para Windows (PowerShell).
# Abre cada proceso en su propia ventana. Redis debe correr en WSL2 o ser Upstash.

Start-Process powershell -ArgumentList "-NoExit","-Command","cd backend; uv run uvicorn app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit","-Command","cd backend; uv run arq app.tareas.worker.ConfiguracionWorker"
Start-Process powershell -ArgumentList "-NoExit","-Command","cd frontend; npm run dev"
Start-Process powershell -ArgumentList "-NoExit","-Command","cloudflared tunnel --url http://localhost:5173"
