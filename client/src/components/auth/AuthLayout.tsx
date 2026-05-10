import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0f2744 0%, #1a3a5c 40%, #0d2035 100%)",
      }}
    >
      {/* Cyan glow top-right — matches Figma */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-150 h-100 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at top right, #00d4ff 0%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Two-column layout */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-8 flex flex-col lg:flex-row items-center justify-between gap-12 py-12">
        {/* ── Left panel: branding ── */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center">
            <span
              className="font-bold text-[32px] tracking-tight"
              style={{ fontFamily: "'MuseoModerno', cursive" }}
            >
              <span className="text-[#2BD1FF]">C</span>
              <span className="text-white">Lingo</span>
            </span>
          </div>

          {/* Tagline */}
          <div className="space-y-4 max-w-sm">
            <h1
              className="text-4xl font-extrabold leading-tight text-[#2BD1FF]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Make Coding Your
              <br />
              Playground
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Improve your coding skills more quickly with an interactive and
              adaptive game-based learning method, designed to help you grasp
              concepts easily and in greater depth
            </p>
          </div>
        </div>

        {/* ── Right panel: auth card ── */}
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
