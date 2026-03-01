import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import TradeList from "@/pages/TradeList";
import AiAnalysis from "@/pages/AiAnalysis";
import EconomicCalendar from "@/pages/EconomicCalendar";
import TradeDiary from "@/pages/TradeDiary";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trades" element={<TradeList />} />
        <Route path="/ai-analysis" element={<AiAnalysis />} />
        <Route path="/economic-calendar" element={<EconomicCalendar />} />
        <Route path="/diary" element={<TradeDiary />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
