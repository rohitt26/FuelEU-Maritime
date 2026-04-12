import { ComparePage } from "./pages/ComparePage";
import { RoutesPage } from "./pages/RoutesPage";
import { BankingPage } from "./pages/BankingPage";
import { PoolingPage } from "./pages/PoolingPage";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 flex gap-4 bg-gray-200">
        <Link to="/">Routes</Link>
        <Link to="/compare">Compare</Link>
        <Link to="/banking">Banking</Link>
        <Link to="/pooling">Pooling</Link>
      </nav>

      <Routes>
        <Route path="/" element={<RoutesPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/banking" element={<BankingPage />} />
        <Route path="/pooling" element={<PoolingPage />} />
      </Routes>
    </BrowserRouter>
  );
}