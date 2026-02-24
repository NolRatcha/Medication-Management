from beanie import Document
from typing import Optional

class MedInfo(Document):
    med_id: int
    guideline: Optional[str] = None
    warning: Optional[str] = None

    class Settings:
        name = "med_info"
