from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.diary import TradeDiary
from schemas.diary import DiaryCreate, DiaryUpdate, DiaryResponse
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 一覧の取得
@router.get("/", response_model=List[DiaryResponse])
def get_diaries(db: Session = Depends(get_db)):
    diaries = db.query(TradeDiary).order_by(TradeDiary.date.desc()).all()
    return diaries

# 日記を新規作成する
@router.post("/", response_model=DiaryResponse)
def create_diary(diary: DiaryCreate, db: Session = Depends(get_db)):
    # 同じ日付がすでにあるかチェック
    existing = db.query(TradeDiary).filter(TradeDiary.date == diary.date).first()
    if existing:
        raise HTTPException(status_code=400, detail="この日付の日記はすでに存在します")

    new_diary = TradeDiary(**diary.model_dump())
    db.add(new_diary)
    db.commit()
    db.refresh(new_diary)
    return new_diary


# 日記を更新する
@router.put("/{diary_id}", response_model=DiaryResponse)
def update_diary(diary_id: int, diary: DiaryUpdate, db: Session = Depends(get_db)):
    target = db.query(TradeDiary).filter(TradeDiary.id == diary_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="日記が見つかりません")

    # Noneでない項目だけ更新する
    update_data = diary.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(target, key, value)

    db.commit()
    db.refresh(target)
    return target


# 日記を削除する
@router.delete("/{diary_id}")
def delete_diary(diary_id: int, db: Session = Depends(get_db)):
    target = db.query(TradeDiary).filter(TradeDiary.id == diary_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="日記が見つかりません")

    db.delete(target)
    db.commit()
    return {"message": "削除しました"}
