// バックエンドのURL
const BASE_URL = "http://localhost:8000";

// 日記一覧を取得する
export const getDiaries = async () => {
  const response = await fetch(`${BASE_URL}/api/diary/`);
  if (!response.ok) throw new Error("取得に失敗しました");
  return response.json();
};

// 日記を新規作成する
export const createDiary = async (data: {
  date: string;
  market_comment: string;
  mental_state: string;
  reflection: string;
  next_day_plan: string;
}) => {
  const response = await fetch(`${BASE_URL}/api/diary/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("作成に失敗しました");
  return response.json();
};

// 日記を更新する
export const updateDiary = async (
  id: number,
  data: {
    market_comment?: string;
    mental_state?: string;
    reflection?: string;
    next_day_plan?: string;
  },
) => {
  const response = await fetch(`${BASE_URL}/api/diary/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("更新に失敗しました");
  return response.json();
};

// 日記を削除する
export const deleteDiary = async (id: number) => {
  const response = await fetch(`${BASE_URL}/api/diary/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("削除に失敗しました");
  return response.json();
};

// トレード一覧を取得する
export const getTrades = async () => {
  const response = await fetch(`${BASE_URL}/api/trades/`);
  if (!response.ok) throw new Error("取得に失敗しました");
  return response.json();
};

// 手入力でトレードを1件登録する
export const createTrade = async (data: {
  close_time: string;
  type: number;
  lots: number;
  symbol: string;
  open_price: number;
  close_price: number;
  profit: number;
  commission: number;
  swap: number;
  comment: string;
}) => {
  const response = await fetch(`${BASE_URL}/api/trades/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("登録に失敗しました");
  return response.json();
};

// トレードを更新する
export const updateTrade = async (id: number, data: {
  close_time?: string;
  type?: number;
  lots?: number;
  open_price?: number;
  close_price?: number;
  profit?: number;
  commission?: number;
  swap?: number;
  comment?: string;
}) => {
  const response = await fetch(`${BASE_URL}/api/trades/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("更新に失敗しました");
  return response.json();
};

// トレードを削除する
export const deleteTrade = async (id: number) => {
  const response = await fetch(`${BASE_URL}/api/trades/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("削除に失敗しました");
  return response.json();
};

// HTMLファイルをインポートする
export const importTrades = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${BASE_URL}/api/trades/import`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("インポートに失敗しました");
  return response.json();
};
