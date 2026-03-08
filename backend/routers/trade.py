from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.trade import Trade
from schemas.trade import TradeCreate, TradeResponse
from typing import List

router = APIRouter()


# データベースの窓口を開いて、使い終わったら閉じる関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# トレード一覧を取得する
@router.get("/", response_model=List[TradeResponse])
def get_trades(db: Session = Depends(get_db)):
    trades = db.query(Trade).order_by(Trade.close_time.desc()).all()
    return trades


# MT4からトレードデータを受け取る（Webhook）
@router.post("/webhook", response_model=TradeResponse)
def receive_trade(trade: TradeCreate, db: Session = Depends(get_db)):
    # 同じチケット番号がすでにあるかチェック（重複防止）
    existing = db.query(Trade).filter(Trade.ticket == trade.ticket).first()
    if existing:
        raise HTTPException(status_code=400, detail="このチケット番号はすでに登録されています")

    new_trade = Trade(**trade.model_dump())
    db.add(new_trade)
    db.commit()
    db.refresh(new_trade)
    return new_trade