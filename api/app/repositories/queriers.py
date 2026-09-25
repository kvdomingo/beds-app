from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.interfaces.db import get_database
from app.repositories.generated import (
    beds,
    patients,
    roles,
    user_role_assignments,
    user_ward_assignments,
    users,
    wards,
)


class Queriers:
    def __init__(self, db: AsyncSession = Depends()):
        self.db = db
        self.wards = wards.AsyncQuerier(conn=db)
        self.beds = beds.AsyncQuerier(conn=db)
        self.patients = patients.AsyncQuerier(conn=db)
        self.users = users.AsyncQuerier(conn=db)
        self.roles = roles.AsyncQuerier(conn=db)
        self.user_ward_assignments = user_ward_assignments.AsyncQuerier(conn=db)
        self.user_role_assignments = user_role_assignments.AsyncQuerier(conn=db)


def get_queriers(db: Annotated[AsyncSession, Depends(get_database)]):
    return Queriers(db=db)
