from beanie import Document
from typing import Optional, List, Union
from pydantic import field_validator

class Patient_hist(Document):
    p_id: int
    history: Optional[str] = None
    diagnosis: Optional[Union[List[str], str]] = None 
    medication: Optional[Union[List[str], str]] = None
    allergies: Optional[Union[List[str], str]] = None
    class Settings:
        name = "patient_hist"
    
    @field_validator('diagnosis', 'medication', 'allergies', mode='before')
    @classmethod
    def ensure_list(cls, v):
        if isinstance(v, str):
            return [item.strip() for item in v.split(",") if item.strip()]
        return v