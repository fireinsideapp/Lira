"""Carga manual de recetas. Uso (desde backend/): uv run python -m datos_iniciales.cargar_datos
Nota: el backend ya hace esto solo al arrancar; este script es por si quieres correrlo aparte."""
import asyncio

from app.bd.base import Base
from app.bd.sesion import Sesion, engine
from app.configuracion import config
from app.modelos import receta as _modelo_receta  # noqa: F401
from app.servicios.servicio_recetas import sembrar


async def main():
    async with engine.begin() as conexion:
        await conexion.run_sync(Base.metadata.create_all)
    async with Sesion() as sesion:
        print("Recetas cargadas:", await sembrar(sesion, config.carpeta_recetas))


if __name__ == "__main__":
    asyncio.run(main())
