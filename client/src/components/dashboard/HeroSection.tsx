import type { User } from "../../types/auth";

interface HeroSectionProps {
  user: User;
}

export default function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="px-10 pt-28 pb-6">
      <div className="max-w-5xl mx-auto flex items-center gap-7">
        {/* Avatar — large circle with cyan border + glow */}
        <div className="shrink-0">
          <div
            className="w-24 h-24 rounded-full overflow-hidden"
            style={{
              border: "3px solid #00c8f0",
              boxShadow:
                "0 0 0 4px rgba(0,200,240,0.15), 0 0 24px rgba(0,200,240,0.3)",
            }}
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                style={{
                  background: "linear-gradient(135deg, #1e4d8c, #0d2a50)",
                }}
              >
                {user.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5">
          <h1
            className="text-3xl font-extrabold text-white"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Welcome <span className="text-[#00c8f0]">{user.display_name}</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Increase your experience and skills and win all the existing awards
          </p>
          <button
            disabled
            className="mt-1 self-start rounded-full px-5 py-1.5 text-xs font-semibold text-slate-300 cursor-not-allowed"
            style={{ border: "1px solid rgba(255,255,255,0.2)" }}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </section>
  );
}
