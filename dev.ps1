# Fase 1 en Windows: backend + frontend + tunel HTTPS (cada uno en su ventana).
Start-Process powershell -ArgumentList "-NoExit","-Command","cd backend; uv run uvicorn app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit","-Command","cd frontend; npm run dev"
Start-Process powershell -ArgumentList "-NoExit","-Command","cloudflared tunnel --url http://localhost:5173"
