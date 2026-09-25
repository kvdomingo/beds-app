from fastapi import APIRouter, Depends, Security

from app.core.auth import get_user
from app.core.utils import alist
from app.repositories.generated.models import User
from app.repositories.queriers import Queriers, get_queriers

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Security(get_user, scopes=["authenticated"])],
)


@router.get("", response_model=list[User])
async def list_users(q: Queriers = Depends(get_queriers)):
    return await alist(q.users.list_users())
