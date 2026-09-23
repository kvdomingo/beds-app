from fastapi import FastAPI
from scalar_fastapi import add_scalar_reference

from app.routers import beds, patients, wards

app = FastAPI(
    title="Beds API",
    docs_url=None,
    redoc_url=None,
    root_path="/api",
)
add_scalar_reference(app, route="/docs")

app.include_router(wards.router)
app.include_router(beds.router)
app.include_router(patients.router)
