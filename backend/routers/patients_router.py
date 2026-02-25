from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional
from datetime import date

from database import get_db
from models.patient_sql_db import Patient, Treatment
from models.patient_mongo_db import Patient_hist

# ==========================================
# Pydantic Schemas
# ==========================================

class PatientCreate(BaseModel):
    name: str
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
    diagnosis: Optional[str] = None
    medication: Optional[str] = None
    allergies: Optional[str] = None

# ==========================================
# Router
# ==========================================

router = APIRouter()

# ------------------------------------------
# Patient CRUD (PostgreSQL)
# ------------------------------------------

@router.get("/", response_model=list[PatientResponse])
async def get_all_patients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient))
    patients = result.scalars().all()
    return patients


@router.get("/{p_id}", response_model=PatientResponse)
async def get_patient(p_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).where(Patient.p_id == p_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(body: PatientCreate, db: AsyncSession = Depends(get_db)):
    patient = Patient(name=body.name, age=body.age, gender=body.gender)
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient


@router.put("/{p_id}", response_model=PatientResponse)
async def update_patient(p_id: int, body: PatientUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).where(Patient.p_id == p_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    if body.name is not None:
        patient.name = body.name
    if body.insurance_id is not None:
        patient.insurance_id = body.insurance_id

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
    # Verify patient exists
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

@router.get("/{p_id}/history")
async def get_patient_history(p_id: int):
    hist = await Patient_hist.find_one(Patient_hist.p_id == p_id)
    if not hist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient history not found")
    return hist


@router.post("/{p_id}/history", status_code=status.HTTP_201_CREATED)
async def create_patient_history(p_id: int, body: PatientHistCreate):
    existing = await Patient_hist.find_one(Patient_hist.p_id == p_id)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="History already exists, use PUT to update")

    hist = Patient_hist(
        p_id=p_id,
        history=body.history,
        diagnosis=body.diagnosis,
        medication=body.medication,
        allergies=body.allergies,
    )
    await hist.insert()
    return hist


@router.put("/{p_id}/history")
async def update_patient_history(p_id: int, body: PatientHistCreate):
    hist = await Patient_hist.find_one(Patient_hist.p_id == p_id)
    if not hist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient history not found")

    update_data = body.model_dump(exclude_none=True)
    await hist.set(update_data)
    return hist