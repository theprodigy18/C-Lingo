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
      className="fixed left-0 right-0 top-0 z-50"
      style={{
        background: "rgba(35, 79, 120, 0.82)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-6 sm:px-10">
        <span
          className="text-xl font-extrabold tracking-tight"
          style={{ fontFamily: "'MuseoModerno', cursive" }}
        >
          <span className="text-[#23d7ff]">C</span>
          <span className="text-white">linggo</span>
        </span>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 items-center gap-2 rounded-full bg-white px-3 text-sm font-bold text-[#1f4166]">
            <span className="text-red-500">{aura}</span>
            <span>Aura</span>
          </div>

          <div className="flex h-8 items-center gap-2 rounded-full bg-white px-3 text-sm font-bold text-[#1f4166]">
            <span>{energy}</span>
            <span className="text-[#23d7ff]">⚡</span>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 hover:text-[#23d7ff]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
