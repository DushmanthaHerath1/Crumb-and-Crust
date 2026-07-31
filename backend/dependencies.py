import jwt
import models
import security
from database import get_db
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy.orm import Session

oauth_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login")


def get_current_admin(
    token: str = Depends(oauth_scheme), db: Session = Depends(get_db)
):
    """
    Validate the JWT token and return the current admin user.
    """

    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearber"},
    )

    try:
        payload = jwt.decode(
            token, security.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        email: str = payload.get("sub")

        if email is None:
            raise credentials_exception

    except InvalidTokenError:
        raise credentials_exception

    user = db.query(models.AdminUser).filter(models.AdminUser.email == email).first()

    if user is None:
        raise credentials_exception

    return user
