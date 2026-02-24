from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import date

from database import get_db
from models.med_sql_models import Medication, Inventory
from models.med_info_mongo_model import MedInfo

router = APIRouter()

class MedicationCreate(BaseModel):
    name: str
    common_name: Optional[str] = None
    price: int

class InventoryCreate(BaseModel):
    med_id: int
    in_day: date
    exp_day: date
    quantity: int

class MedInfoCreate(BaseModel):
    med_id: int
    guideline: Optional[str] = None
    warning: Optional[str] = None

@router.post("/medication")
async def add_medication(data: MedicationCreate, db: AsyncSession = Depends(get_db)):
    new_med = Medication(name=data.name, common_name=data.common_name, price=data.price)
    db.add(new_med)
    await db.commit()
    await db.refresh(new_med)
    return {"status": "success", "med_id": new_med.med_id, "name": new_med.name}

@router.get("/medication")
async def get_medications(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Medication))
    meds = result.scalars().all()
    return [{"med_id": m.med_id, "name": m.name, "common_name": m.common_name, "price": m.price} for m in meds]

@router.post("/stock")
async def add_stock(data: InventoryCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Medication).where(Medication.med_id == data.med_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail=f"Medication id {data.med_id} not found")
    new_stock = Inventory(med_id=data.med_id, in_day=data.in_day, exp_day=data.exp_day, quantity=data.quantity)
    db.add(new_stock)
    await db.commit()
    await db.refresh(new_stock)
    return {"status": "success", "inv_id": new_stock.inv_id}

@router.get("/stock")
async def get_stock(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Inventory))
    stocks = result.scalars().all()
    return [{"inv_id": s.inv_id, "med_id": s.med_id, "in_day": s.in_day, "exp_day": s.exp_day, "quantity": s.quantity} for s in stocks]

@router.post("/medinfo")
async def add_med_info(data: MedInfoCreate):
    existing = await MedInfo.find_one(MedInfo.med_id == data.med_id)
    if existing:
        raise HTTPException(status_code=400, detail=f"MedInfo for med_id {data.med_id} already exists")
    await MedInfo(med_id=data.med_id, guideline=data.guideline, warning=data.warning).insert()
    return {"status": "success", "med_id": data.med_id}

@router.get("/medinfo")
async def get_med_info():
    infos = await MedInfo.find_all().to_list()
    return [{"med_id": i.med_id, "guideline": i.guideline, "warning": i.warning} for i in infos]

@router.get("/view")
async def view_medications(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Medication))
    meds = result.scalars().all()
    output = []
    for med in meds:
        stocks = (await db.execute(select(Inventory).where(Inventory.med_id == med.med_id))).scalars().all()
        med_info = await MedInfo.find_one(MedInfo.med_id == med.med_id)
        output.append({
            "med_id": med.med_id, "name": med.name, "common_name": med.common_name, "price": med.price,
            "stock": [{"inv_id": s.inv_id, "in_day": s.in_day, "exp_day": s.exp_day, "quantity": s.quantity} for s in stocks],
            "med_info": {"guideline": med_info.guideline if med_info else None, "warning": med_info.warning if med_info else None}
        })
    return output
