from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models.staff_sql_db import StaffInfo
from passlib.context import CryptContext
from pydantic import BaseModel, constr

class RegisterSchema(BaseModel):
    username: str
    password: constr(min_length=1, max_length=72)
    name: str
    role: str

class LoginSchema(BaseModel):
    username: str
    password: str

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register")
async def register(payload: RegisterSchema, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(StaffInfo).where(StaffInfo.username == payload.username))
    exists = result.scalar_one_or_none()

    print("RAW PASSWORD:", payload.password)
    print("LENGTH:", len(payload.password))
    print("BYTES:", len(payload.password.encode("utf-8")))

    if exists:
        raise HTTPException(status_code=400, detail="USERNAME_TAKEN")
    
    hashed_pw = pwd_context.hash(payload.password)

    user = StaffInfo(username=payload.username, password=hashed_pw, name=payload.name, role=payload.role)
    try:
        db.add(user)
    except:
        raise HTTPException(status_code=500, detail="DB_ERROR")
    await db.commit()

    return {"message": "User Created successfully."}

@router.post("/login")
async def login(payload: LoginSchema, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(StaffInfo).where(StaffInfo.username == payload.username))
    user = result.scalar_one_or_none()

    if not user or not pwd_context.verify(payload.password, user.password):
        raise HTTPException(status_code=400, detail="Username doesn't exists or wrong password.")
    
    return {"status": "success"}