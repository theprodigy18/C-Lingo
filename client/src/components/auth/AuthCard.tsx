import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="rounded-[4rem] bg-white p-10 shadow-[0_0_50px_10px_rgba(0,180,216,0.4)] lg:p-16">
      {children}
    </div>
  );
}
