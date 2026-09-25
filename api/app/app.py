from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from scalar_fastapi import add_scalar_reference

from app.routers import beds, patients, wards

app = FastAPI(
    title="Beds API",
    docs_url=None,
    redoc_url=None,
    root_path="/api",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)
add_scalar_reference(app, route="/docs")


@app.get("/health", response_class=PlainTextResponse)
def health_check():
    return "ok"


app.include_router(wards.router)
app.include_router(beds.router)
app.include_router(patients.router)
