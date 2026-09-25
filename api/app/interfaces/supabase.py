from supabase import AsyncClient, create_async_client

from app.settings import settings

supabase: AsyncClient | None = None


async def get_supabase() -> AsyncClient:
    global supabase

    if supabase is None:
        supabase = await create_async_client(
            supabase_url=settings.SUPABASE_URL.encoded_string(),
            supabase_key=settings.SUPABASE_SECRET_KEY.get_secret_value(),
        )

    return supabase
