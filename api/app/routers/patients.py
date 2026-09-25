from typing import Annotated

from fastapi import APIRouter, Body, Depends, Security

from app.core.auth import get_user
from app.core.utils import alist
from app.repositories.generated.models import Patient
from app.repositories.generated.patients import ListPatientsRow
from app.repositories.queriers import Queriers, get_queriers

router = APIRouter(
    prefix="/patients",
    tags=["patients"],
    dependencies=[Security(get_user, scopes=["authenticated"])],
)


@router.get("", response_model=list[ListPatientsRow])
async def list_patients(q: Queriers = Depends(get_queriers)):
    return await alist(q.patients.list_patients())


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


@router.delete("/{id}", response_model=Patient)
async def check_out_patient(id: str, q: Queriers = Depends(get_queriers)):
    res = await q.patients.check_out_patient(id=id)
    await q.db.commit()
    return res


@router.put("/{id}", response_model=Patient)
async def move_patient(
    id: str,
    bed_id: Annotated[str, Body(embed=True)],
    q: Queriers = Depends(get_queriers),
):
    res = await q.patients.move_patient(id=id, bed_id=bed_id)
    await q.db.commit()
    return res
