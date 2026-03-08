import { useState, useEffect, useRef } from "react";
import { Trade } from "../types";
import { getTrades, createTrade, updateTrade, deleteTrade, importTrades } from "../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Upload,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CalendarIcon,
  Pencil,
  Trash2,
} from "lucide-react";

// 売買方向の表示設定（0=BUY, 1=SELL）
const typeConfig = {
  0: { label: "BUY", className: "bg-emerald-600 hover:bg-emerald-700" },
  1: { label: "SELL", className: "bg-red-600 hover:bg-red-700" },
};

// 日時を読みやすい形に変換する関数
const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const date = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${date} ${time}`;
};

// 損益に応じて色を返す関数
const profitColor = (profit: number) => {
  if (profit > 0) return "text-emerald-500";
  if (profit < 0) return "text-red-500";
  return "text-muted-foreground";
};

// 日付文字列を YYYY-MM-DD 形式に変換する関数
const toDateString = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// 日付文字列から時刻を HH:MM 形式で取り出す関数
const toTimeString = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// フォームの空の初期値
const emptyForm = {
  date: "",
  time: "12:00",
  type: "0",
  lots: "",
  symbol: "GOLD",
  open_price: "",
  close_price: "",
  profit: "",
  commission: "0",
  swap: "0",
  comment: "",
};

const TradeList = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTrades().then((data) => setTrades(data));
  }, []);

  const totalProfit = trades.reduce(
    (sum, t) => sum + t.profit + t.commission + t.swap,
    0
  );
  const winCount = trades.filter((t) => t.profit > 0).length;
  const loseCount = trades.filter((t) => t.profit < 0).length;
  const winRate =
    trades.length > 0
      ? ((winCount / trades.length) * 100).toFixed(1)
      : "0.0";

  // --- 新規作成ボタン ---
  const handleCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  // --- 編集ボタン ---
  const handleEdit = (trade: Trade) => {
    setEditingId(trade.id);
    setForm({
      date: toDateString(trade.close_time),
      time: toTimeString(trade.close_time),
      type: String(trade.type),
      lots: String(trade.lots),
      symbol: trade.symbol,
      open_price: String(trade.open_price),
      close_price: String(trade.close_price),
      profit: String(trade.profit),
      commission: String(trade.commission),
      swap: String(trade.swap),
      comment: trade.comment,
    });
    setIsFormOpen(true);
  };

  // --- 保存ボタン ---
  const handleSave = async () => {
    const closeTime = `${form.date}T${form.time}:00`;
    if (editingId === null) {
      await createTrade({
        close_time: closeTime,
        type: parseInt(form.type),
        lots: parseFloat(form.lots),
        symbol: form.symbol,
        open_price: parseFloat(form.open_price),
        close_price: parseFloat(form.close_price),
        profit: parseFloat(form.profit),
        commission: parseFloat(form.commission),
        swap: parseFloat(form.swap),
        comment: form.comment,
      });
    } else {
      await updateTrade(editingId, {
        close_time: closeTime,
        type: parseInt(form.type),
        lots: parseFloat(form.lots),
        open_price: parseFloat(form.open_price),
        close_price: parseFloat(form.close_price),
        profit: parseFloat(form.profit),
        commission: parseFloat(form.commission),
        swap: parseFloat(form.swap),
        comment: form.comment,
      });
    }
    const data = await getTrades();
    setTrades(data);
    setIsFormOpen(false);
  };

  // --- 削除ボタン ---
  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteTrade(deleteTargetId!);
    const data = await getTrades();
    setTrades(data);
    setIsDeleteOpen(false);
    setDeleteTargetId(null);
  };

  // --- HTMLインポート ---
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importTrades(file);
    setImportMessage(result.message);
    const data = await getTrades();
    setTrades(data);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTimeout(() => setImportMessage(""), 3000);
  };

  const isFormValid =
    form.date && form.lots && form.open_price && form.close_price && form.profit;

  return (
    <div className="space-y-6">
      {/* ===== ヘッダー ===== */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">トレード一覧</h1>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".html,.htm"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            HTMLインポート
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            手入力
          </Button>
        </div>
      </div>

      {/* インポート結果メッセージ */}
      {importMessage && (
        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-500">
          {importMessage}
        </div>
      )}

      {/* ===== サマリーカード ===== */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />合計損益
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${profitColor(totalProfit)}`}>
              {totalProfit >= 0 ? "+" : ""}{totalProfit.toFixed(0)} 円
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />勝率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{winRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-emerald-500" />勝ち
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-500">{winCount} 回</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-red-500" />負け
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{loseCount} 回</p>
          </CardContent>
        </Card>
      </div>

      {/* ===== トレード一覧テーブル ===== */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">取引履歴</CardTitle>
            <span className="text-sm text-muted-foreground">{trades.length} 件</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {trades.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              トレードデータがありません。「手入力」か「HTMLインポート」でデータを追加しましょう！
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">決済日時</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">方向</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">入力元</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Lot</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">エントリー</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">決済</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">手数料</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">損益</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => {
                    const type = typeConfig[trade.type as 0 | 1] ?? typeConfig[0];
                    const netProfit = trade.profit + trade.commission + trade.swap;
                    return (
                      <tr
                        key={trade.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDateTime(trade.close_time)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={type.className}>{type.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {trade.source === "manual" ? (
                            <Badge variant="outline" className="border-violet-500/50 text-violet-400 text-xs">
                              手入力
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-slate-500/50 text-slate-400 text-xs">
                              インポート
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">{trade.lots}</td>
                        <td className="px-4 py-3 text-right">{trade.open_price}</td>
                        <td className="px-4 py-3 text-right">{trade.close_price}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {trade.commission !== 0 ? trade.commission.toFixed(0) : "-"}
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${profitColor(netProfit)}`}>
                          {netProfit >= 0 ? "+" : ""}{netProfit.toFixed(0)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEdit(trade)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDeleteClick(trade.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== 手入力・編集ダイアログ ===== */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId === null ? "トレードを手入力" : "トレードを編集"}</DialogTitle>
            <DialogDescription>
              {editingId === null ? "トレードの結果を手動で記録します。" : "内容を変更して保存してください。"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">決済日</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
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
              <div>
                <label className="mb-1 block text-sm font-medium">時刻</label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">売買方向</label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm({ ...form, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">BUY（買い）</SelectItem>
                  <SelectItem value="1">SELL（売り）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Lot</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.01"
                value={form.lots}
                onChange={(e) => setForm({ ...form, lots: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">エントリー価格</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="5072.87"
                  value={form.open_price}
                  onChange={(e) => setForm({ ...form, open_price: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">決済価格</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="5080.00"
                  value={form.close_price}
                  onChange={(e) => setForm({ ...form, close_price: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">損益（円）</label>
              <Input
                type="number"
                placeholder="1300"
                value={form.profit}
                onChange={(e) => setForm({ ...form, profit: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">手数料</label>
                <Input
                  type="number"
                  value={form.commission}
                  onChange={(e) => setForm({ ...form, commission: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">スワップ</label>
                <Input
                  type="number"
                  value={form.swap}
                  onChange={(e) => setForm({ ...form, swap: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>キャンセル</Button>
            <Button onClick={handleSave} disabled={!isFormValid}>
              {editingId === null ? "登録" : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== 削除確認ダイアログ ===== */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>トレードを削除しますか？</DialogTitle>
            <DialogDescription>この操作は取り消せません。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>キャンセル</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>削除する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TradeList;
