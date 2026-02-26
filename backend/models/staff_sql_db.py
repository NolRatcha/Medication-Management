from sqlalchemy import Column, BigInteger, String
from database import Base

class StaffInfo(Base):
    __tablename__ = "staff"

    staff_id = Column(BigInteger, primary_key = True, autoincrement = True)
    username = Column(String(255), nullable=False, unique = True)
    password = Column(String(255), nullable = False)
    name = Column(String(255), nullable = False)
    role = Column(String(255), nullable = False)