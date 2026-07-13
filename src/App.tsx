import { HashRouter, Route, Routes } from "react-router-dom";
import AppShell from "@/components/AppShell";
import Compare from "@/pages/Compare";
import Home from "@/pages/Home";
import MarketDetail from "@/pages/MarketDetail";

export default function App() {
  return (
    <HashRouter basename={import.meta.env.BASE_URL}>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/market/:marketKey" element={<MarketDetail />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}
