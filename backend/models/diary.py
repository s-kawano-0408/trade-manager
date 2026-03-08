from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from sqlalchemy.sql import func
from database import Base


class TradeDiary(Base):
    __tablename__ = "trade_diary"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, unique=True, nullable=False)
    market_comment = Column(Text, default="")
    mental_state = Column(String(10), default="normal")
    reflection = Column(Text, default="")
    next_day_plan = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())