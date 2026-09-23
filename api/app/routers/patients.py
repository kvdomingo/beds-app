from typing import Annotated

from fastapi import APIRouter, Body, Depends

from app.repositories.generated.models import Patient
from app.repositories.queriers import Queriers, get_queriers

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/{id}", response_model=Patient)
async def get_patient(id: str, q: Queriers = Depends(get_queriers)):
    return await q.patients.get_patient(id=id)


@router.post("", response_model=Patient)
async def check_in_patient(
    name: Annotated[str, Body(embed=True)],
    bed_id: Annotated[str, Body(embed=True)],
    q: Queriers = Depends(get_queriers),
):
    res = await q.patients.check_in_patient(name=name, bed_id=bed_id)
    await q.db.commit()
    return res


@router.post("/{id}", response_model=Patient)
async def check_out_patient(id: str, q: Queriers = Depends(get_queriers)):
    res = await q.patients.check_out_patient(id=id)
    await q.db.commit()
    return res


@router.put("/{id}", response_model=Patient)
async def move_patient(
    bed_id: Annotated[str, Body(embed=True)], q: Queriers = Depends(get_queriers)
):
    res = await q.patients.move_patient(id=id, bed_id=bed_id)
    await q.db.commit()
    return res
