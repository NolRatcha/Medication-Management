from beanie import Document
from mongoengine import DateTimeField
from typing import Optional
from datetime import datetime, UTC

class StaffAuth(Document):
    staff_id: int
    action: int

    class Settings:
        name = "staff_auth"

class EventLog(Document):
    event_id: int
    staff_id: int
    date: datetime = DateTimeField(default = lambda: datetime.now(UTC))
    action: Optional[str] = None
    description: Optional[str] = None

    class Settings:
        name = "event_log"