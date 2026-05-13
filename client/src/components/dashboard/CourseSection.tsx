export const CourseSection = () => {
  return (
    <section id="courses">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-clingo-blue">Course</h2>
        <a className="text-sm text-gray-400 hover:text-white cursor-pointer font-poppins" href="#">See All</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Course Card */}
        <div className="relative rounded-2xl overflow-hidden bg-clingo-dark border border-clingo-blue/30 cursor-pointer transition-all hover:border-clingo-blue/50" style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}>
          <div className="h-44 bg-gradient-to-br from-slate-800 to-slate-900 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-14 h-14 bg-clingo-blue/20 rounded-full flex items-center justify-center border border-clingo-blue/40 backdrop-blur-sm cursor-pointer">
                <svg className="w-6 h-6 text-clingo-blue ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-5 text-center">
            <h3 className="text-lg font-bold text-white mb-1 font-museo">Level 1</h3>
            <p className="text-gray-400 text-sm font-poppins">Introduction C</p>
          </div>
        </div>

        {/* Locked Course 1 */}
        <div className="relative rounded-2xl overflow-hidden bg-clingo-dark/50 border border-white/5 grayscale cursor-not-allowed opacity-60">
          <div className="h-44 bg-slate-900/50 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-slate-800/80 rounded-full flex items-center justify-center border border-white/10">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-5 text-center">
            <h3 className="text-lg font-bold text-gray-500 mb-1 font-museo">Locked</h3>
            <p className="text-gray-600 text-xs font-poppins">Complete previous lesson</p>
          </div>
        </div>

        {/* Locked Course 2 */}
        <div className="relative rounded-2xl overflow-hidden bg-clingo-dark/50 border border-white/5 grayscale cursor-not-allowed opacity-60">
          <div className="h-44 bg-slate-900/50 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-slate-800/80 rounded-full flex items-center justify-center border border-white/10">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-5 text-center">
            <h3 className="text-lg font-bold text-gray-500 mb-1 font-museo">Locked</h3>
            <p className="text-gray-600 text-xs font-poppins">Complete previous lesson</p>
          </div>
        </div>
      </div>
    </section>
  );
};