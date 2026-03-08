from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime
from sqlalchemy.sql import func
from database import Base


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket = Column(Integer, unique=True, nullable=False)
    symbol = Column(String(20), default="GOLD")
    type = Column(Integer, default=0)
    lots = Column(Numeric(10, 2), default=0)
    open_price = Column(Numeric(10, 5), default=0)
    close_price = Column(Numeric(10, 5), default=0)
    open_time = Column(DateTime)
    close_time = Column(DateTime)
    profit = Column(Numeric(10, 2), default=0)
    commission = Column(Numeric(10, 2), default=0)
    swap = Column(Numeric(10, 2), default=0)
    magic_number = Column(Integer, default=0)
    comment = Column(Text, default="")
    source = Column(String(10), default="import")  # "manual" or "import"
    created_at = Column(DateTime, server_default=func.now())