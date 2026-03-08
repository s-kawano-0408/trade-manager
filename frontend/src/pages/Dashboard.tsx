import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ダッシュボード用サマリーデータの型定義
type DailyProfit = {
  date: string;
  profit: number;
};

type RecentTrade = {
  id: number;
  close_time: string;
  type: number;
  profit: number;
};

type Summary = {
  total_profit: number;
  win_rate: number;
  trade_count: number;
  daily_profits: DailyProfit[];
  recent_trades: RecentTrade[];
};

const Dashboard = () => {
  // サマリーデータを保存する箱
  const [summary, setSummary] = useState<Summary | null>(null);
  // 読み込み中かどうかのフラグ
  const [loading, setLoading] = useState(true);

  // ページを開いたときにサマリーを取得する
  useEffect(() => {
    fetch("http://localhost:8000/api/trades/summary")
      .then((res) => res.json())
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 読み込み中の表示
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        読み込み中...
      </div>
    );
  }

  // データがない場合の表示
  if (!summary) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        データを取得できませんでした
      </div>
    );
  }

  // 合計損益の表示色（プラスなら緑、マイナスなら赤）
  const totalProfitColor =
    summary.total_profit >= 0 ? "text-green-400" : "text-red-400";

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-slate-100">ダッシュボード</h1>

      {/* 上部：3つの指標カード */}
      <div className="grid grid-cols-3 gap-4">
        {/* 合計損益 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-normal">
              合計損益
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalProfitColor}`}>
              {summary.total_profit >= 0 ? "+" : ""}
              {summary.total_profit.toLocaleString()} 円
            </p>
          </CardContent>
        </Card>

        {/* 勝率 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-normal">
              勝率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-400">
              {summary.win_rate}%
            </p>
          </CardContent>
        </Card>

        {/* 総取引数 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-normal">
              総取引数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100">
              {summary.trade_count} 件
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 下部：グラフ + 直近トレード */}
      <div className="grid grid-cols-3 gap-4">
        {/* 日次損益グラフ（左2/3） */}
        <Card className="col-span-2 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400 font-normal">
              日次損益
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.daily_profits.length === 0 ? (
              <p className="text-slate-500 text-sm">データがありません</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={summary.daily_profits}
                  margin={{ top: 4, right: 16, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "6px",
                      color: "#f1f5f9",
                    }}
                    formatter={(value: number) => [
                      `${value.toLocaleString()} 円`,
                      "損益",
                    ]}
                  />
                  <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                    {summary.daily_profits.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.profit >= 0 ? "#4ade80" : "#f87171"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 直近トレード（右1/3） */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400 font-normal">
              直近トレード
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.recent_trades.length === 0 ? (
              <p className="text-slate-500 text-sm">データがありません</p>
            ) : (
              <ul className="space-y-3">
                {summary.recent_trades.map((trade) => {
                  const profitColor =
                    trade.profit >= 0 ? "text-green-400" : "text-red-400";
                  return (
                    <li
                      key={trade.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <span className="text-slate-300">
                          {trade.close_time}
                        </span>
                        <span
                          className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                            trade.type === 0
                              ? "bg-blue-900 text-blue-300"
                              : "bg-rose-900 text-rose-300"
                          }`}
                        >
                          {trade.type === 0 ? "BUY" : "SELL"}
                        </span>
                      </div>
                      <span className={`font-medium ${profitColor}`}>
                        {trade.profit >= 0 ? "+" : ""}
                        {trade.profit.toLocaleString()}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
