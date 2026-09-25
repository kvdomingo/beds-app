from datetime import timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from scalar_fastapi import get_scalar_api_reference
from starlette.middleware.authentication import AuthenticationMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.core.auth import SupabaseAuthBackend
from app.routers import auth, beds, patients, roles, users, wards
from app.settings import settings

app = FastAPI(
    title="Beds API",
    docs_url=None,
    redoc_url=None,
    root_path="/api",
)
app.add_middleware(
    AuthenticationMiddleware,
    backend=SupabaseAuthBackend(),
)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY.get_secret_value(),
    session_cookie="session",
    max_age=int(timedelta(hours=16).total_seconds()),
    path="/",
    same_site="strict",
    https_only=settings.is_prod,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/docs", include_in_schema=False)
async def docs():
    return get_scalar_api_reference(
        title=app.title,
        openapi_url=app.openapi_url,
        persist_auth=True,
    )


@app.get("/health", response_class=PlainTextResponse)
async def health_check():
    return "ok"


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(wards.router)
app.include_router(beds.router)
app.include_router(patients.router)
