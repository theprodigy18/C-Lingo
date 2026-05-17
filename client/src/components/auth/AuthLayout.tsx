import type { ReactNode } from 'react';
import { BrandSection } from './BrandSection';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-8"
      style={{
        background:
          'radial-gradient(circle at 70% 50%, #1e3a5f 0%, #0d1b2a 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row lg:gap-8">
        <BrandSection />

        <section className="w-full lg:w-[540px] bg-white rounded-[4rem] p-10 lg:p-16 auth-card-shadow">
          {children}
        </section>
      </main>
    </div>
  );
};
