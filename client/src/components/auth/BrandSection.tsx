export const BrandSection = () => {
  return (
    <section className="w-full lg:w-1/2 text-white space-y-8 px-4 lg:px-0">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 flex items-center justify-center">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="cGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00B4D8" />
                <stop offset="100%" stopColor="#0096B7" />
              </linearGradient>
            </defs>
            <text
              x="50"
              y="72"
              fontSize="65"
              fontWeight="bold"
              fontFamily="'MuseoModerno', cursive, sans-serif"
              fill="url(#cGradient)"
              textAnchor="middle"
            >
              C
            </text>
          </svg>
        </div>
        <h1 className="font-museo text-4xl font-bold tracking-tight">C-Lingo</h1>
      </div>

      <div className="max-w-xl space-y-6">
        <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
          Make Coding Your <br />
          <span className="text-clingo-blue">Playground</span>
        </h2>
        <p className="text-lg text-gray-300 font-light leading-relaxed">
          Improve your coding skills more quickly with an interactive and
          adaptive game-based learning method, designed to help you grasp
          concepts easily and in greater depth
        </p>
      </div>
    </section>
  );
};
