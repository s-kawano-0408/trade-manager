from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import cast, Date
from database import SessionLocal
from models.trade import Trade
from schemas.trade import TradeCreate, TradeResponse, TradeManualCreate, TradeUpdate
from typing import List
from datetime import datetime
from bs4 import BeautifulSoup
import time

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

# 手入力でトレードを1件登録する
@router.post("/manual", response_model=TradeResponse)
def create_trade_manual(trade: TradeManualCreate, db: Session = Depends(get_db)):
    # ticketをタイムスタンプから自動生成
    ticket = int(time.time())

    new_trade = Trade(
        ticket=ticket,
        close_time=trade.close_time,
        type=trade.type,
        lots=trade.lots,
        symbol=trade.symbol,
        open_price=trade.open_price,
        close_price=trade.close_price,
        profit=trade.profit,
        commission=trade.commission,
        swap=trade.swap,
        comment=trade.comment,
        open_time=trade.close_time,  # 手入力では決済時刻を代用
        magic_number=0,
        source="manual",
    )
    db.add(new_trade)
    db.commit()
    db.refresh(new_trade)
    return new_trade


# MT4のHTMLファイルを一括インポートする
@router.post("/import")
async def import_trades(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # HTMLファイルを読み込む
    content = await file.read()
    soup = BeautifulSoup(content, "html.parser")

    # テーブルの全行を取得する
    rows = soup.find_all("tr")

    imported = []
    dates_in_file = set()

    for row in rows:
        cells = row.find_all("td")
        # データ行は13列。列数が違う行はスキップ
        if len(cells) != 13:
            continue

        try:
            ticket = int(cells[0].get_text(strip=True))
            open_time = datetime.strptime(cells[1].get_text(strip=True), "%Y.%m.%d %H:%M:%S")
            trade_type = 0 if cells[2].get_text(strip=True).lower() == "buy" else 1
            lots = float(cells[3].get_text(strip=True))
            symbol = cells[4].get_text(strip=True)
            open_price = float(cells[5].get_text(strip=True))
            close_time = datetime.strptime(cells[8].get_text(strip=True), "%Y.%m.%d %H:%M:%S")
            close_price = float(cells[9].get_text(strip=True))
            commission = float(cells[10].get_text(strip=True))
            swap = float(cells[11].get_text(strip=True))
            profit = float(cells[12].get_text(strip=True))
        except (ValueError, IndexError):
            # パースできない行はスキップ
            continue

        # この行の日付を記録する
        dates_in_file.add(close_time.date())
        imported.append({
            "ticket": ticket,
            "open_time": open_time,
            "type": trade_type,
            "lots": lots,
            "symbol": symbol,
            "open_price": open_price,
            "close_price": close_price,
            "close_time": close_time,
            "commission": commission,
            "swap": swap,
            "profit": profit,
            "magic_number": 0,
            "comment": "",
            "source": "import",
        })

    if not imported:
        raise HTTPException(status_code=400, detail="有効なトレードデータが見つかりませんでした")

    # HTMLに含まれる日付の既存データを全削除（上書きルール）
    for d in dates_in_file:
        db.query(Trade).filter(cast(Trade.close_time, Date) == d).delete()

    # 新しいデータをINSERT
    for t in imported:
        db.add(Trade(**t))

    db.commit()
    return {"message": f"{len(imported)} 件のトレードをインポートしました"}


# トレードを更新する
@router.put("/{trade_id}", response_model=TradeResponse)
def update_trade(trade_id: int, trade: TradeUpdate, db: Session = Depends(get_db)):
    target = db.query(Trade).filter(Trade.id == trade_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="トレードが見つかりません")

    update_data = trade.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(target, key, value)

    db.commit()
    db.refresh(target)
    return target


# トレードを削除する
@router.delete("/{trade_id}")
def delete_trade(trade_id: int, db: Session = Depends(get_db)):
    target = db.query(Trade).filter(Trade.id == trade_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="トレードが見つかりません")

    db.delete(target)
    db.commit()
    return {"message": "削除しました"}

# ダッシュボード用サマリーを取得する
@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    # 全トレードを取得する
    trades = db.query(Trade).order_by(Trade.close_time.desc()).all()

    if not trades:
        return {
            "total_profit": 0,
            "win_rate": 0,
            "trade_count": 0,
            "daily_profits": [],
            "recent_trades": [],
        }

    # 勝率を計算する
    win_count = sum(1 for t in trades if t.profit > 0)
    win_rate = round(win_count / len(trades) * 100, 1)

    # 日付ごとの損益を集計する
    daily_map = {}
    for t in trades:
        day = t.close_time.strftime("%Y/%m/%d")
        net = float(t.profit) + float(t.commission) + float(t.swap)
        daily_map[day] = daily_map.get(day, 0) + net

    # 日付順に並べる
    daily_profits = [
        {"date": day, "profit": round(profit, 0)}
        for day, profit in sorted(daily_map.items())
    ]

    # 合計損益を計算する
    total_profit = sum(d["profit"] for d in daily_profits)

    # 直近5件のトレード
    recent = trades[:5]
    recent_trades = [
        {
            "id": t.id,
            "close_time": t.close_time.strftime("%m/%d %H:%M"),
            "type": t.type,
            "profit": float(t.profit) + float(t.commission) + float(t.swap),
        }
        for t in recent
    ]

    return {
        "total_profit": round(total_profit, 0),
        "win_rate": win_rate,
        "trade_count": len(trades),
        "daily_profits": daily_profits,
        "recent_trades": recent_trades,
    }