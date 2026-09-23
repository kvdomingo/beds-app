from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.settings import settings

engine = create_async_engine(settings.database_url)

session = async_sessionmaker(bind=engine)


async def get_database() -> AsyncGenerator[AsyncSession]:
    async with session() as db:
        yield db
