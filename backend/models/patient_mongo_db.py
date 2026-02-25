from beanie import Document
from typing import Optional

class Patient_hist(Document):
    p_id: int
    history: Optional[str] = None
    diagnosis: Optional[str] = None
    medication: Optional[str] = None
    allergies: Optional[str] = None

    class Settings:
        name = "patient_hist"
