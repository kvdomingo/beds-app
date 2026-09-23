from typing import Annotated

from fastapi import APIRouter, Body, Depends

from app.core.utils import alist
from app.repositories.generated.models import Bed
from app.repositories.queriers import Queriers, get_queriers

router = APIRouter(prefix="/beds", tags=["beds"])


@router.get("", response_model=list[Bed])
async def list_beds(q: Queriers = Depends(get_queriers)):
    return await alist(q.beds.list_all_beds())


@router.post("", response_model=Bed)
async def create_bed(
    ward_id: Annotated[str, Body(embed=True)], q: Queriers = Depends(get_queriers)
):
    res = await q.beds.create_bed(ward_id=ward_id)
    await q.db.commit()
    return res


@router.delete("/{id}", response_model=Bed)
async def delete_bed(id: str, q: Queriers = Depends(get_queriers)):
    res = await q.beds.delete_bed(id=id)
    await q.db.commit()
    return res
