export const Footer = () => {
  return (
    <footer className="bg-clingo-dark border-t border-white/10 pt-12 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-6 h-6" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="cGradientFoot" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00B4D8" />
                    <stop offset="100%" stopColor="#0096B7" />
                  </linearGradient>
                </defs>
                <text x="50" y="72" fontSize="65" fontWeight="bold" fontFamily="'MuseoModerno', cursive, sans-serif" fill="url(#cGradientFoot)" textAnchor="middle">C</text>
              </svg>
              <span className="text-clingo-blue text-2xl font-museo font-bold">C-Lingo</span>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-poppins">Make Coding Your Playground</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm text-white font-poppins">Help</h4>
            <ul className="space-y-2">
              <li><a className="text-xs text-gray-500 hover:text-clingo-blue cursor-pointer font-poppins" href="#">Privacy Policy</a></li>
              <li><a className="text-xs text-gray-500 hover:text-clingo-blue cursor-pointer font-poppins" href="#">About Your Account</a></li>
              <li><a className="text-xs text-gray-500 hover:text-clingo-blue cursor-pointer font-poppins" href="#">Usage Guide</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm text-white font-poppins">C-Lingo</h4>
            <ul className="space-y-2">
              <li><a className="text-xs text-gray-500 hover:text-clingo-blue cursor-pointer font-poppins" href="#">About Us</a></li>
              <li><a className="text-xs text-gray-500 hover:text-clingo-blue cursor-pointer font-poppins" href="#">Sponsorship</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm text-white font-poppins">Contact Us</h4>
            <ul className="space-y-2">
              <li className="text-xs text-gray-400 hover:text-clingo-blue cursor-pointer font-poppins">clingo@gmail.com</li>
              <li className="text-xs text-gray-500 font-poppins">Every Day 7/24</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-gray-600 font-poppins">Copyright © 2026 C-Lingo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};