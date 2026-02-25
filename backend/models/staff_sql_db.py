from sqlalchemy import Column, BigInteger, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class StaffInfo(Base):
    __table_name__ = "staff"

    staff_id = Column(
        BigInteger,
        primary_key = True,
        autoincrement = True
        )
    name = Column(String(255), nullable = False)
    role = Column(String(255), nullable = False)