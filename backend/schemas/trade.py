from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


class TradeCreate(BaseModel):
    ticket: int
    symbol: str = "XAUUSD"
    type: int = 0
    lots: float
    open_price: float
    close_price: float
    open_time: datetime
    close_time: datetime
    profit: float
    commission: float = 0.0
    swap: float = 0.0
    magic_number: int = 0
    comment: str = ""


class TradeResponse(BaseModel):
    id: int
    ticket: int
    symbol: str
    type: int
    lots: float
    open_price: float
    close_price: float
    open_time: datetime
    close_time: datetime
    profit: float
    commission: float
    swap: float
    magic_number: int
    comment: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True