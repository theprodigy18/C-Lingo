import React from "react";
import Header from "./Header";
import Footer from "./Footer";

interface AppLayoutProps {
  children: React.ReactNode;
  aura?: number;
  energy?: number;
}

export default function AppLayout({
  children,
  aura = 0,
  energy = 0,
}: AppLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col text-white"
      style={{
        background:
          "linear-gradient(180deg, #234f78 0%, #203f63 34%, #16243b 82%, #111827 100%)",
      }}
    >
      <Header aura={aura} energy={energy} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
