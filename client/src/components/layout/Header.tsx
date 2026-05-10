import { useNavigate } from "react-router-dom";
import { clearAuth } from "../../lib/token";

interface HeaderProps {
  aura: number;
  energy: number;
}

export default function Header({ aura, energy }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/sign-in", { replace: true });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4"
      style={{
        background: "rgba(20, 40, 68, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Logo */}
      <span
        className="text-xl font-bold tracking-tight"
        style={{ fontFamily: "'MuseoModerno', cursive" }}
      >
        <span className="text-[#00c8f0]">C</span>
        <span className="text-white">Lingo</span>
      </span>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Aura pill */}
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-white"
          style={{ background: "#1e4d8c", border: "1px solid #2a6bc2" }}
        >
          <span className="text-[#00c8f0] text-xs">●</span>
          <span>{aura} Aura</span>
        </div>

        {/* Energy pill */}
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-white"
          style={{ background: "#1e4d8c", border: "1px solid #2a6bc2" }}
        >
          <span>⚡</span>
          <span>{energy}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
