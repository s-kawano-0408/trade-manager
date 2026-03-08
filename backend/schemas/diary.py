from pydantic import BaseModel
from datetime import date as Date
from typing import Optional


class DiaryCreate(BaseModel):
    date: Date
    market_comment: str = ""
    mental_state: str = "normal"
    reflection: str = ""
    next_day_plan: str = ""


class DiaryUpdate(BaseModel):
    date: Optional[Date] = None
    market_comment: Optional[str] = None
    mental_state: Optional[str] = None
    reflection: Optional[str] = None
    next_day_plan: Optional[str] = None


class DiaryResponse(BaseModel):
    id: int
    date: Date
    market_comment: str
    mental_state: str
    reflection: str
    next_day_plan: str

    class Config:
        from_attributes = True