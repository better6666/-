import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "@/components/AppShell";
import Compare from "@/pages/Compare";
import Home from "@/pages/Home";
import MarketDetail from "@/pages/MarketDetail";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/market/:marketKey" element={<MarketDetail />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
