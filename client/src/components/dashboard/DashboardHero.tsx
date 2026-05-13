interface DashboardHeroProps {
  user: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const DashboardHero = ({ user }: DashboardHeroProps) => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 flex items-center justify-between gap-12">
      <div className="w-36 h-36 rounded-full bg-[#102b46] flex items-center justify-center overflow-hidden border-2 border-white/10 shrink-0">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            className="w-16 h-16 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </div>

      <div className="flex-1 text-left space-y-3">
        <h1 className="text-3xl font-bold text-[#22D3EE]">
          Welcome {user.display_name}
        </h1>
        <p className="text-gray-300 text-base max-w-lg">
          Increase your experience and skills and win all the existing awards.
        </p>
        <button
          type="button"
          className="mt-2 px-6 py-2.5 bg-[#22D3EE] text-[#071626] rounded-xl font-semibold text-sm hover:bg-[#67e8f9] transition-colors cursor-pointer"
        >
          Edit Profile
        </button>
      </div>
    </section>
  );
};