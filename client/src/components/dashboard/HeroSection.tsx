import type { User } from "../../types/auth";

interface HeroSectionProps {
  user: User;
}

export default function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="px-6 pb-24 pt-32 sm:px-10 sm:pb-32 sm:pt-40">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 sm:flex-row sm:gap-12">
        <div className="flex shrink-0 flex-col items-center gap-4">
          <div className="h-40 w-40 overflow-hidden rounded-full bg-[#00569a] shadow-[0_8px_18px_rgba(10,24,42,0.35)] sm:h-56 sm:w-56">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_25%,#1cb4f5_0,#00579b_44%,#004477_100%)] text-7xl font-black text-white">
                {user.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <button
            disabled
            className="rounded-full border border-white px-4 py-1 text-xs font-bold text-white opacity-95"
          >
            Edit Profil
          </button>
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-extrabold leading-tight text-[#23d7ff] sm:text-5xl lg:text-6xl">
            Welcome {user.display_name}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/90">
            increase your experience and skills and win all the existing awards
          </p>
        </div>
      </div>
    </section>
  );
}
