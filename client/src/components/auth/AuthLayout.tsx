import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4"
      style={{
        background:
          "radial-gradient(circle at 70% 50%, #1e3a5f 0%, #0d1b2a 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-12 py-10 lg:flex-row lg:gap-8">
        <section className="w-full space-y-8 px-2 text-white lg:w-1/2 lg:px-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-full w-full fill-[#00b4d8]">
                <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                <path d="m2 17 10 5 10-5" />
                <path d="m2 12 10 5 10-5" />
              </svg>
            </div>
            <span
              className="text-4xl font-bold tracking-tight"
              style={{ fontFamily: "'MuseoModerno', cursive" }}
            >
              CLingo
            </span>
          </div>

          <div className="max-w-xl space-y-6">
            <h1 className="text-5xl font-bold leading-tight lg:text-6xl">
              Make Coding Your
              <br />
              <span className="text-[#00b4d8]">Playground</span>
            </h1>
            <p className="text-lg font-light leading-relaxed text-gray-300">
              Improve your coding skills more quickly with an interactive and
              adaptive game-based learning method, designed to help you grasp
              concepts easily and in greater depth
            </p>
          </div>
        </section>

        <section className="w-full lg:w-[540px]">{children}</section>
      </main>
    </div>
  );
}
