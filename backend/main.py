from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import diary, trade

Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:5173"],
      allow_methods=["*"],
      allow_headers=["*"],
  )

# 日記のルーターを登録する
app.include_router(diary.router, prefix="/api/diary")
app.include_router(trade.router, prefix="/api/trades")