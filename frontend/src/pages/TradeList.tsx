import { useState, useEffect } from "react";
import { Trade } from "../types";
import { getTrades } from "../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 売買方向の表示設定（0=BUY, 1=SELL）
const typeConfig = {
  0: { label: "BUY", className: "bg-emerald-600 hover:bg-emerald-700" },
  1: { label: "SELL", className: "bg-red-600 hover:bg-red-700" },
};

// 日時を読みやすい形に変換する関数
// 例: "2026-03-07T09:15:00" → "2026/03/07 09:15"
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

const TradeList = () => {
  const [trades, setTrades] = useState<Trade[]>([]);

  // 画面が開いたとき、APIからトレード一覧を取得する
  useEffect(() => {
    getTrades().then((data) => setTrades(data));
  }, []);

  // 合計損益を計算する
  const totalProfit = trades.reduce((sum, t) => sum + t.profit + t.commission + t.swap, 0);

  // 勝ちトレードの数
  const winCount = trades.filter((t) => t.profit > 0).length;

  // 勝率を計算する
  const winRate = trades.length > 0 ? ((winCount / trades.length) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* ===== ヘッダー ===== */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">トレード一覧</h1>
        <span className="text-sm text-muted-foreground">{trades.length} 件</span>
      </div>

      {/* ===== サマリーカード ===== */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">合計損益</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${profitColor(totalProfit)}`}>
              {totalProfit >= 0 ? "+" : ""}
              {totalProfit.toFixed(0)} 円
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">勝率</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{winRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">総トレード数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{trades.length} 回</p>
          </CardContent>
        </Card>
      </div>

      {/* ===== トレード一覧テーブル ===== */}
      <Card>
        <CardContent className="p-0">
          {trades.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              トレードデータがありません
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">決済日時</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">方向</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Lot</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">エントリー</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">決済</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">損益</th>
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
                        <td className="px-4 py-3 text-right">{trade.lots}</td>
                        <td className="px-4 py-3 text-right">{trade.open_price}</td>
                        <td className="px-4 py-3 text-right">{trade.close_price}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${profitColor(netProfit)}`}>
                          {netProfit >= 0 ? "+" : ""}
                          {netProfit.toFixed(0)}
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
    </div>
  );
};

export default TradeList;
