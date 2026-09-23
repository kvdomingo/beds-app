from typing import Annotated

from fastapi import APIRouter, Body, Depends

from app.core.utils import alist
from app.repositories.generated.beds import CountBedsByWardRow
from app.repositories.generated.models import Bed
from app.repositories.queriers import Queriers, get_queriers

router = APIRouter(prefix="/beds", tags=["beds"])


@router.get("", response_model=list[Bed])
async def list_beds(q: Queriers = Depends(get_queriers)):
    return await alist(q.beds.list_all_beds())


@router.get("/counts", response_model=list[CountBedsByWardRow])
async def count_beds(q: Queriers = Depends(get_queriers)):
    return await alist(q.beds.count_beds_by_ward())


@router.post("", response_model=Bed)
async def create_bed(
    ward_id: Annotated[str, Body(embed=True)], q: Queriers = Depends(get_queriers)
):
    return await q.beds.create_bed(ward_id=ward_id)


@router.delete("/{id}", response_model=Bed)
async def delete_bed(id: str, q: Queriers = Depends(get_queriers)):
    return await q.beds.delete_bed(id=id)
