import { ComparePage } from "./pages/ComparePage";
import { RoutesPage } from "./pages/RoutesPage";
import { BankingPage } from "./pages/BankingPage";
import { PoolingPage } from "./pages/PoolingPage";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";

const NavItem = ({ to, label }: { to: string; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative px-2 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-200 
        ${isActive ? "text-black" : "text-slate-500 hover:text-black"}`}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
      )}
    </Link>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      {/* Mid-Tone "Concrete" Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-slate-200 border-b border-slate-300 shadow-sm">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8 h-8 bg-black">
              <span className="text-white text-[12px] font-black tracking-tighter">M</span>
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">Compliance</p>
              <p className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.1em]">Intelligence System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-6 lg:gap-10">
            <NavItem to="/" label="Routes" />
            <NavItem to="/compare" label="Compare" />
            <NavItem to="/banking" label="Banking" />
            <NavItem to="/pooling" label="Pooling" />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<RoutesPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/banking" element={<BankingPage />} />
          <Route path="/pooling" element={<PoolingPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}