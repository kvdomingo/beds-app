from typing import Annotated

from fastapi import APIRouter, Body, Depends

from app.core.utils import alist
from app.repositories.generated.models import Ward
from app.repositories.queriers import Queriers, get_queriers

router = APIRouter(prefix="/wards", tags=["wards"])


@router.get("", response_model=list[Ward])
async def list_wards(q: Queriers = Depends(get_queriers)):
    return await alist(q.wards.list_wards())


@router.post("", response_model=Ward)
async def create_ward(
    name: Annotated[str, Body(embed=True)], q: Queriers = Depends(get_queriers)
):
    return await q.wards.create_ward(name=name)
