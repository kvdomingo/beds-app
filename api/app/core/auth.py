import json

from fastapi import HTTPException, Request, status
from fastapi.security import SecurityScopes
from loguru import logger
from pydantic import ValidationError
from starlette.authentication import (
    AuthCredentials,
    AuthenticationBackend,
    AuthenticationError,
    BaseUser,
)
from starlette.requests import HTTPConnection

from app.repositories.generated.users import GetUserByProviderIdWithRolesRow


class AppUser(GetUserByProviderIdWithRolesRow, BaseUser):
    @property
    def is_authenticated(self) -> bool:
        return True

    @property
    def display_name(self) -> str:
        return self.name

    @property
    def identity(self) -> str:
        return self.provider_id


class SupabaseAuthBackend(AuthenticationBackend):
    async def authenticate(
        self, conn: HTTPConnection
    ) -> tuple[AuthCredentials, BaseUser] | None:
        auth = conn.session.get("user")
        logger.debug(auth)

        if not auth:
            return None

        try:
            user = AppUser.model_validate(auth)
        except ValidationError, json.JSONDecodeError:
            raise AuthenticationError("Malformed auth cookie")
        except Exception as e:
            logger.error(e)
            raise AuthenticationError("Unexpected error") from e

        return AuthCredentials(["authenticated", *user.roles]), user


def get_user(request: Request, scopes: SecurityScopes) -> AppUser:
    if not request.user.is_authenticated:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    if not set(scopes.scopes) <= set(request.auth.scopes):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    return request.user
