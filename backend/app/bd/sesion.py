"""Motor asincrono y fabrica de sesiones de base de datos."""
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.configuracion import config

engine = create_async_engine(config.database_url)
Sesion = async_sessionmaker(engine, expire_on_commit=False)


async def obtener_sesion():
    """Dependencia de FastAPI: una sesion por peticion."""
    async with Sesion() as sesion:
        yield sesion
