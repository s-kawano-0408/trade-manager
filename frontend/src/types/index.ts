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
