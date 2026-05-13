export const HeroSection = () => {
  return (
    <header className="max-w-7xl mx-auto px-6 pt-12 pb-8 flex flex-col items-center text-center">
      <div className="mb-6">
        <div className="w-32 h-32 rounded-full bg-clingo-dark flex items-center justify-center border-4 border-clingo-blue/30" style={{ boxShadow: '0 0 50px 10px rgba(34, 211, 238, 0.3)' }}>
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
        Welcome <span className="text-clingo-blue">Ivan Alfariziq</span>
      </h1>
      <p className="text-gray-400 text-sm max-w-md font-poppins">
        Increase your experience and skills and win all the existing awards.
      </p>
    </header>
  );
};