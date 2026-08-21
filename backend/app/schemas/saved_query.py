from pydantic import BaseModel
from datetime import datetime

class SavedQueryCreate(BaseModel):
    name: str
    question: str
    sql: str

class SavedQueryResponse(BaseModel):
    id: int
    user_id: int
    name: str
    question: str
    sql: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
