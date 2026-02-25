from sqlalchemy import Column, BigInteger, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Patient(Base):
    __tablename__ = "patient"

    p_id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    insurance_id = Column(String(100), nullable=True)

    treatments = relationship("Treatment", back_populates="patient")


class Treatment(Base):
    __tablename__ = "treatment"

    t_id = Column(BigInteger, primary_key=True, autoincrement=True)
    p_id = Column(BigInteger, ForeignKey("patient.p_id"), nullable=False)
    med_id = Column(BigInteger, ForeignKey("medication.med_id"), nullable=False)
    amount = Column(BigInteger, nullable=False)
    date = Column(Date, nullable=False)

    patient = relationship("Patient", back_populates="treatments")