from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import date
from passlib.context import CryptContext

from database import get_db
from models.patient_sql_db import Patient, Treatment
from models.patient_mongo_db import Patient_hist

# ==========================================
# Helpers
# ==========================================

def parse_csv(value: Optional[str]) -> Optional[List[str]]:
    """Split a comma-separated string into a cleaned list, or return None."""
    if value is None:
        return None
    return [item.strip() for item in value.split(",") if item.strip()]

# ==========================================
# Pydantic Schemas
# ==========================================

class PatientCreate(BaseModel):
    name: str
    citizen_id: str
    age: int
    gender: str

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None

class PatientResponse(BaseModel):
    p_id: int
    name: str
    age: int
    gender: str

    class Config:
        from_attributes = True

class TreatmentCreate(BaseModel):
    med_id: int
    amount: int
    date: date

class TreatmentResponse(BaseModel):
    t_id: int
    p_id: int
    med_id: int
    amount: int
    date: date

    class Config:
        from_attributes = True

class PatientHistCreate(BaseModel):
    history: Optional[str] = None
    diagnosis: Optional[str] = None   # e.g. "Diabetes, Hypertension"
    medication: Optional[str] = None  # e.g. "Metformin, Amlodipine"
    allergies: Optional[str] = None   # e.g. "Penicillin, Aspirin"

class PatientHistResponse(BaseModel):
    p_id: int
    history: Optional[str] = None
    diagnosis: Optional[List[str]] = None
    medication: Optional[List[str]] = None
    allergies: Optional[List[str]] = None

# ==========================================
# Router
# ==========================================

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==========================================
# dependencies
# ==========================================

from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # ถอดรหัส Token เพื่อเอาข้อมูลที่ฝังไว้
        payload = jwt.decode(token, "your-very-secret-key-change-this", algorithms=["HS256"])
        user_id: int = payload.get("id")
        role: str = payload.get("role")
        if user_id is None or role is None:
            raise credentials_exception
        return {"id": user_id, "role": role}
    except JWTError:
        raise credentials_exception

# ------------------------------------------
# Patient CRUD (PostgreSQL)
# ------------------------------------------

@router.get("/", response_model=list[PatientResponse])
async def get_all_patients(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user) # เช็ค Token ตรงนี้
):
    role = current_user["role"].lower()
    u_id = current_user["id"]

    if role == "pharmacist":
        # เภสัช: ดูได้ทุกคน
        result = await db.execute(select(Patient))
    
    elif role == "doctor":
        # หมอ: ดูได้เฉพาะคนไข้ที่ตนเองดูแล (ถ้าคุณเพิ่มคอลัมน์ doctor_id แล้ว)
        result = await db.execute(select(Patient).where(Patient.doctor_id == u_id))
        
    elif role == "patient":
        # คนไข้: ดูได้แค่ข้อมูลตัวเอง
        result = await db.execute(select(Patient).where(Patient.p_id == u_id))
        
    else:
        raise HTTPException(status_code=403, detail="Unauthorized")

    return result.scalars().all()


@router.get("/{p_id}", response_model=PatientResponse)
async def get_patient(p_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).where(Patient.p_id == p_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(body: PatientCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    
    # 1. เอา citizen_id มาเข้ารหัสเพื่อทำเป็นรหัสผ่าน
    hashed_pw = pwd_context.hash(body.citizen_id)
    doctor_id = current_user["id"]
    # 2. *** จุดสำคัญ: ต้องโยน citizen_id และ password เข้าไปในโมเดล Patient ด้วย ***
    patient = Patient(
        name=body.name, 
        citizen_id=body.citizen_id, # ใส่เลขบัตร ปชช.
        password=hashed_pw,         # ใส่รหัสผ่านที่เข้ารหัสแล้ว
        age=body.age, 
        gender=body.gender,
        doctor_id=doctor_id
    )
    
    db.add(patient)
    
    # 3. ดักจับ Error เผื่อในกรณีที่ชื่อหรือเลขบัตรประชาชนซ้ำกันในระบบ
    try:
        await db.commit()
        await db.refresh(patient)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Cannot create patient"
        )
        
    return patient


@router.put("/{p_id}", response_model=PatientResponse)
async def update_patient(
    p_id: int, 
    body: PatientUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Only doctor can update patient")
    result = await db.execute(select(Patient).where(Patient.p_id == p_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    if body.name is not None:
        patient.name = body.name
    if body.age is not None:
        patient.age = body.age
    if body.gender is not None:
        patient.gender = body.gender

    await db.commit()
    await db.refresh(patient)
    return patient


@router.delete("/{p_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(p_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).where(Patient.p_id == p_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    await db.delete(patient)
    await db.commit()

# ------------------------------------------
# Treatment (PostgreSQL)
# ------------------------------------------

@router.get("/{p_id}/treatments", response_model=list[TreatmentResponse])
async def get_treatments(p_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Treatment).where(Treatment.p_id == p_id))
    treatments = result.scalars().all()
    return treatments


@router.post("/{p_id}/treatments", response_model=TreatmentResponse, status_code=status.HTTP_201_CREATED)
async def add_treatment(p_id: int, body: TreatmentCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).where(Patient.p_id == p_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    treatment = Treatment(p_id=p_id, med_id=body.med_id, amount=body.amount, date=body.date)
    db.add(treatment)
    await db.commit()
    await db.refresh(treatment)
    return treatment

# ------------------------------------------
# Patient History (MongoDB via Beanie)
# ------------------------------------------

@router.get("/{p_id}/history", response_model=PatientHistResponse)
async def get_patient_history(p_id: int):
    hist = await Patient_hist.find_one(Patient_hist.p_id == p_id)
    if not hist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient history not found")
    return hist


@router.post("/{p_id}/history", response_model=PatientHistResponse, status_code=status.HTTP_201_CREATED)
async def create_patient_history(p_id: int, body: PatientHistCreate):
    existing = await Patient_hist.find_one(Patient_hist.p_id == p_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="History already exists, use PUT to update"
        )

    hist = Patient_hist(
        p_id=p_id,
        history=body.history,
        diagnosis=parse_csv(body.diagnosis),
        medication=parse_csv(body.medication),
        allergies=parse_csv(body.allergies),
    )
    await hist.insert()
    return hist



@router.put("/{p_id}/history", response_model=PatientHistResponse)
async def update_patient_history(p_id: int, body: PatientHistCreate):
    hist = await Patient_hist.find_one(Patient_hist.p_id == p_id)
    if not hist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient history not found")

    update_data: dict = {}
    if body.history is not None:
        update_data["history"] = body.history
    if body.diagnosis is not None:
        update_data["diagnosis"] = parse_csv(body.diagnosis)
    if body.medication is not None:
        update_data["medication"] = parse_csv(body.medication)
    if body.allergies is not None:
        update_data["allergies"] = parse_csv(body.allergies)

    if update_data:
        await hist.set(update_data)

    return hist

