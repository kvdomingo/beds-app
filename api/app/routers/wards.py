from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status

from app.core.utils import alist
from app.repositories.generated.models import Bed, User, Ward
from app.repositories.generated.wards import ListWardsCountsRow
from app.repositories.queriers import Queriers, get_queriers

router = APIRouter(prefix="/wards", tags=["wards"])


@router.get("", response_model=list[ListWardsCountsRow])
async def list_wards(q: Queriers = Depends(get_queriers)):
    return await alist(q.wards.list_wards_counts())


@router.get("/{id}/beds", response_model=list[Bed])
async def list_beds_in_ward(id: str, q: Queriers = Depends(get_queriers)):
    return await alist(q.beds.list_beds_in_ward(ward_id=id))


@router.get("/{id}/users", response_model=list[User])
async def list_users_assigned_to_ward(id: str, q: Queriers = Depends(get_queriers)):
    return await alist(q.users.list_users_in_ward(ward_id=id))


@router.post("", response_model=Ward)
async def create_ward(
    name: Annotated[str, Body(embed=True)],
    bed_capacity: Annotated[int, Body(embed=True)],
    q: Queriers = Depends(get_queriers),
):
    res = await q.wards.create_ward(name=name)
    if res is not None:
        await alist(q.beds.create_beds(ward_id=res.id, count=bed_capacity))

    await q.db.commit()
    return res


@router.put("/{id}", response_model=Ward)
async def update_ward(
    id: str,
    name: Annotated[str, Body(embed=True)],
    bed_capacity: Annotated[int, Body(embed=True, ge=0)],
    q: Queriers = Depends(get_queriers),
):
    ward = await q.wards.get_ward(id=id)
    if ward is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    total_beds = (await q.beds.count_total_beds_in_ward(ward_id=id)) or 0
    available_beds = (await q.beds.count_available_beds_in_ward(ward_id=id)) or 0
    occupied_beds = total_beds - available_beds
    if bed_capacity < occupied_beds:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot set lower bed capacity ({bed_capacity}) than available beds ({available_beds}).",
        )

    res = await q.wards.update_ward(id=id, name=name)
    if res is not None:
        diff = bed_capacity - total_beds
        if diff < 0:
            await alist(q.beds.delete_beds(ward_id=ward.id, limit=abs(diff)))
        elif diff > 0:
            await alist(q.beds.create_beds(ward_id=ward.id, count=diff))

    await q.db.commit()
    return res


@router.delete("/{id}", response_model=Ward)
async def delete_ward(id: str, q: Queriers = Depends(get_queriers)):
    res = await q.wards.delete_ward(id=id)
    await q.db.commit()
    return res
