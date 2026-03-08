from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


class TradeCreate(BaseModel):
    ticket: int
    symbol: str = "GOLD"
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
    source: Optional[str] = "import"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TradeManualCreate(BaseModel):
    close_time: datetime
    type: int = 0
    lots: float
    symbol: str = "GOLD"
    open_price: float
    close_price: float
    profit: float
    commission: float = 0.0
    swap: float = 0.0
    comment: str = ""


class TradeUpdate(BaseModel):
    close_time: Optional[datetime] = None
    type: Optional[int] = None
    lots: Optional[float] = None
    open_price: Optional[float] = None
    close_price: Optional[float] = None
    profit: Optional[float] = None
    commission: Optional[float] = None
    swap: Optional[float] = None
    comment: Optional[str] = None