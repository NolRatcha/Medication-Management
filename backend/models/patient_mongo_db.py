from beanie import Document
from typing import Optional, List

class Patient_hist(Document):
    p_id: int
    history: Optional[str] = None
    diagnosis: Optional[List[str]] = None
    medication: Optional[List[str]] = None
    allergies: Optional[List[str]] = None

    class Settings:
        name = "patient_hist"