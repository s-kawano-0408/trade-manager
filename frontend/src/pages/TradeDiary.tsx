import { useState } from "react";
import { DiaryEntry } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, CalendarIcon } from "lucide-react";

// モックデータ（ダミーの日記データ）
const initialDiaries: DiaryEntry[] = [
  {
    id: 1,
    date: "2026-03-07",
    market_comment:
      "NFP前で慎重にトレードできた。午前中のレンジで3回スキャル成功。",
    mental_state: "good",
    reflection:
      "指標直前にポジションを持ちかけた。ルール通り見送れたのは良かった。",
    next_day_plan: "週末なのでノートレード。来週の指標を確認しておく。",
    created_at: "2026-03-07T20:00:00",
    updated_at: "2026-03-07T20:00:00",
  },
  {
    id: 2,
    date: "2026-03-06",
    market_comment:
      "レンジ相場が続いて方向感がなかった。無理にエントリーして負けが増えた。",
    mental_state: "bad",
    reflection:
      "レンジだと気づいた時点でやめるべきだった。3連敗後にロットを上げたのは最悪。",
    next_day_plan: "明日はNFP前日なので慎重に。午前中だけに絞る。",
    created_at: "2026-03-06T21:00:00",
    updated_at: "2026-03-06T21:00:00",
  },
  {
    id: 3,
    date: "2026-03-05",
    market_comment:
      "FOMC議事録の日。午前中はきれいなトレンドが出て取りやすかった。",
    mental_state: "normal",
    reflection:
      "午後にFOMC警戒でスプレッドが広がったのに気づかずエントリーした。",
    next_day_plan: "イベント前はスプレッドを確認してからエントリーする。",
    created_at: "2026-03-05T20:30:00",
    updated_at: "2026-03-05T20:30:00",
  },
];

// メンタル状態の表示設定
const mentalConfig = {
  good: { label: "良い", variant: "default" as const, className: "bg-emerald-600 hover:bg-emerald-700" },
  normal: { label: "普通", variant: "secondary" as const, className: "" },
  bad: { label: "悪い", variant: "destructive" as const, className: "" },
};

// フォームの空の初期値
const emptyForm = {
  date: "",
  market_comment: "",
  mental_state: "normal" as DiaryEntry["mental_state"],
  reflection: "",
  next_day_plan: "",
};

const TradeDiary = () => {
  // 日記データの状態管理
  const [diaries, setDiaries] = useState<DiaryEntry[]>(initialDiaries);

  // ダイアログの開閉状態
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // 編集中の日記ID（nullなら新規作成モード）
  const [editingId, setEditingId] = useState<number | null>(null);

  // 削除対象の日記ID
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // フォームの入力値
  const [form, setForm] = useState(emptyForm);

  // --- 新規作成ボタンを押したとき ---
  const handleCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  // --- 編集ボタンを押したとき ---
  const handleEdit = (diary: DiaryEntry) => {
    setEditingId(diary.id);
    setForm({
      date: diary.date,
      market_comment: diary.market_comment,
      mental_state: diary.mental_state,
      reflection: diary.reflection,
      next_day_plan: diary.next_day_plan,
    });
    setIsFormOpen(true);
  };

  // --- フォームの保存ボタンを押したとき ---
  const handleSave = () => {
    if (editingId === null) {
      // 新規作成
      const newDiary: DiaryEntry = {
        id: Date.now(),
        ...form,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setDiaries([newDiary, ...diaries]);
    } else {
      // 更新
      setDiaries(
        diaries.map((d) =>
          d.id === editingId
            ? { ...d, ...form, updated_at: new Date().toISOString() }
            : d
        )
      );
    }
    setIsFormOpen(false);
  };

  // --- 削除ボタンを押したとき（確認ダイアログを開く） ---
  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteOpen(true);
  };

  // --- 削除を確定したとき ---
  const handleDeleteConfirm = () => {
    setDiaries(diaries.filter((d) => d.id !== deleteTargetId));
    setIsDeleteOpen(false);
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-6">
      {/* ===== ヘッダー部分 ===== */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">トレード日記</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </div>

      {/* ===== 日記カードの一覧 ===== */}
      {diaries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            まだ日記がありません。「新規作成」ボタンから最初の日記を書きましょう！
          </CardContent>
        </Card>
      ) : (
        diaries.map((diary) => {
          const mental = mentalConfig[diary.mental_state];
          return (
            <Card key={diary.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{diary.date}</CardTitle>
                    <Badge variant={mental.variant} className={mental.className}>
                      {mental.label}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(diary)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(diary.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 相場の感想 */}
                <div className="rounded-md bg-muted/50 p-4">
                  <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
                    相場の感想
                  </h3>
                  <p className="text-sm leading-relaxed">
                    {diary.market_comment}
                  </p>
                </div>

                {/* 反省点と翌日への意識を横並び */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md bg-muted/50 p-4">
                    <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
                      反省点
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {diary.reflection}
                    </p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-4">
                    <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
                      翌日への意識
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {diary.next_day_plan}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* ===== 新規作成・編集ダイアログ ===== */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId === null ? "新しい日記を書く" : "日記を編集する"}
            </DialogTitle>
            <DialogDescription>
              今日のトレードを振り返って記録しましょう。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 日付 */}
            <div>
              <label className="mb-1 block text-sm font-medium">日付</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.date ? form.date : "日付を選択"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.date ? new Date(form.date + "T00:00:00") : undefined}
                    onSelect={(date) =>
                      setForm({
                        ...form,
                        date: date
                          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                          : "",
                      })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* メンタル状態 */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                メンタル状態
              </label>
              <Select
                value={form.mental_state}
                onValueChange={(value: DiaryEntry["mental_state"]) =>
                  setForm({ ...form, mental_state: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">良い</SelectItem>
                  <SelectItem value="normal">普通</SelectItem>
                  <SelectItem value="bad">悪い</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 相場の感想 */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                相場の感想
              </label>
              <Textarea
                placeholder="今日の相場はどうでしたか？"
                value={form.market_comment}
                onChange={(e) =>
                  setForm({ ...form, market_comment: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* 反省点 */}
            <div>
              <label className="mb-1 block text-sm font-medium">反省点</label>
              <Textarea
                placeholder="改善できるポイントはありましたか？"
                value={form.reflection}
                onChange={(e) =>
                  setForm({ ...form, reflection: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* 翌日への意識 */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                翌日への意識
              </label>
              <Textarea
                placeholder="明日意識したいことは？"
                value={form.next_day_plan}
                onChange={(e) =>
                  setForm({ ...form, next_day_plan: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={!form.date}>
              {editingId === null ? "作成" : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== 削除確認ダイアログ ===== */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>日記を削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は取り消せません。本当に削除しますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TradeDiary;
