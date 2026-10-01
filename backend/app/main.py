"""App FastAPI. Al iniciar crea las tablas y carga/actualiza las recetas desde los JSON."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import recetas, voz
from app.bd.base import Base
from app.bd.sesion import Sesion, engine
from app.configuracion import config
from app.modelos import receta as _modelo_receta  # noqa: F401  (registra la tabla)
from app.servicios.servicio_recetas import sembrar


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fase 1: create_all. Cuando el esquema cambie seguido, pasar a Alembic.
    async with engine.begin() as conexion:
        await conexion.run_sync(Base.metadata.create_all)
    async with Sesion() as sesion:
        n = await sembrar(sesion, config.carpeta_recetas)
        print(f"Recetas cargadas: {n}")
    yield


app = FastAPI(title="Lyra", lifespan=lifespan)

# Configuración de CORS para permitir la conexión desde el frontend (localhost o IP local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recetas.router, prefix="/api")
app.include_router(voz.router, prefix="/api")


@app.get("/api/salud")
async def salud():
    return {"ok": True}