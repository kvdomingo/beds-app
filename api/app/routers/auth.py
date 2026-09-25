from typing import Annotated

from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    Request,
    Security,
    status,
)
from pydantic import EmailStr, SecretStr
from supabase import AsyncClient
from supabase_auth import (
    SignInWithEmailAndPasswordCredentials,
    SignOutOptions,
    SignUpWithEmailAndPasswordCredentials,
    SignUpWithEmailAndPasswordCredentialsOptions,
)

from app.core.auth import AppUser, get_user
from app.interfaces.supabase import get_supabase
from app.repositories.queriers import Queriers, get_queriers

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=AppUser)
async def login(
    request: Request,
    email: Annotated[EmailStr, Body(embed=True)],
    password: Annotated[SecretStr, Body(embed=True)],
    q: Queriers = Depends(get_queriers),
    supabase: AsyncClient = Depends(get_supabase),
):
    auth = await supabase.auth.sign_in_with_password(
        credentials=SignInWithEmailAndPasswordCredentials(
            email=email, password=password.get_secret_value()
        )
    )
    if (supa_user := auth.user) is None or (supa_session := auth.session) is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    db_user = await q.users.get_user_by_provider_id_with_roles(provider_id=supa_user.id)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    request.session.update(
        {
            "user": db_user.model_dump(mode="json"),
            "access_token": supa_session.access_token,
            "refresh_token": supa_session.refresh_token,
        }
    )
    return db_user


@router.get(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Security(get_user, scopes=["authenticated"])],
)
async def logout(request: Request, supabase: AsyncClient = Depends(get_supabase)):
    await supabase.auth.sign_out(
        options=SignOutOptions(scope="local"),
    )
    request.session.clear()


@router.get(
    "/me",
    response_model=AppUser,
    dependencies=[Security(get_user, scopes=["authenticated"])],
)
async def me(request: Request):
    return request.user


@router.post("/signup", response_model=AppUser, status_code=status.HTTP_201_CREATED)
async def signup(
    request: Request,
    name: Annotated[str, Body(embed=True)],
    email: Annotated[EmailStr, Body(embed=True)],
    password: Annotated[SecretStr, Body(embed=True)],
    q: Queriers = Depends(get_queriers),
    supabase: AsyncClient = Depends(get_supabase),
):
    auth = await supabase.auth.sign_up(
        SignUpWithEmailAndPasswordCredentials(
            email=email,
            password=password.get_secret_value(),
            options=SignUpWithEmailAndPasswordCredentialsOptions(
                data={"display_name": name}
            ),
        )
    )
    if (supa_user := auth.user) is None or (supa_session := auth.session) is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    user = await q.users.self_sign_up(provider_id=supa_user.id, name=name, email=email)
    await q.db.commit()
    if user is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    request.session.update(
        {
            "user": user.model_dump(mode="json"),
            "access_token": supa_session.access_token,
            "refresh_token": supa_session.refresh_token,
        }
    )
    return user
