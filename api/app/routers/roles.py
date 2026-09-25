from fastapi import APIRouter, Depends

from app.core.utils import alist
from app.repositories.generated.models import Role
from app.repositories.queriers import Queriers, get_queriers

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("", response_model=list[Role])
async def list_roles(q: Queriers = Depends(get_queriers)):
    return await alist(q.roles.list_roles())
