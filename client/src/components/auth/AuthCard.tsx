import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="relative">
      {/* Outer glow layers */}
      <div
        className="absolute -inset-3 rounded-4xl opacity-60 blur-2xl"
        style={{
          background:
            "linear-gradient(135deg, #00c8f0 0%, #0077ff 50%, #00c8f0 100%)",
        }}
      />
      <div
        className="absolute -inset-1 rounded-4xl opacity-40 blur-md"
        style={{
          background: "linear-gradient(135deg, #00e5ff 0%, #0099ff 100%)",
        }}
      />
      {/* Card */}
      <div
        className="relative w-full rounded-3xl bg-white px-10 py-12"
        style={{
          boxShadow:
            "0 0 0 1px rgba(0,200,240,0.3), 0 40px 80px rgba(0,0,0,0.4)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
