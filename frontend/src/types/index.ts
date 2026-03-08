export type DiaryEntry = {
  id: number;
  date: string;
  market_comment: string;
  mental_state: "good" | "normal" | "bad";
  reflection: string;
  next_day_plan: string;
  created_at: string;
  updated_at: string;
};

// トレードデータの型定義
export type Trade = {
  id: number;
  ticket: number;
  symbol: string;
  type: number;
  lots: number;
  open_price: number;
  close_price: number;
  open_time: string;
  close_time: string;
  profit: number;
  commission: number;
  swap: number;
  magic_number: number;
  comment: string;
  created_at: string;
};
