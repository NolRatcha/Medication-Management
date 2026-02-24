from sqlalchemy import Column, BigInteger, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Medication(Base):
    __tablename__ = "medication"

    med_id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    common_name = Column(String(255), nullable=True)
    price = Column(BigInteger, nullable=False)

    inventory = relationship("Inventory", back_populates="medication")

class Inventory(Base):
    __tablename__ = "inventory"

    inv_id = Column(BigInteger, primary_key=True, autoincrement=True)
    med_id = Column(BigInteger, ForeignKey("medication.med_id"), nullable=False)
    in_day = Column(Date, nullable=False)
    exp_day = Column(Date, nullable=False)
    quantity = Column(BigInteger, nullable=False)

    medication = relationship("Medication", back_populates="inventory")
