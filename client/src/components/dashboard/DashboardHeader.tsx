import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../../lib/authSession';
import { notification } from '../../lib/notifications';

export const DashboardHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    const result = await notification.confirm({
      title: 'Sign out?',
      message: 'You will need to sign in again to access your dashboard.',
      variant: 'warning',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
    });

    if (!result.isConfirmed) {
      return;
    }

    clearAuthSession();
    navigate('/signin', { replace: true });
  };

  return (
    <header
      className={`sticky top-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'backdrop-blur-md bg-[#0d1b2a]/80' : ''
        }`}
    >
      <div className="flex items-center gap-2">
        <svg className="w-8 h-8" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cGradientDash" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
          </defs>
          <text
            x="50"
            y="72"
            fontSize="65"
            fontWeight="bold"
            fontFamily="'MuseoModerno', cursive, sans-serif"
            fill="url(#cGradientDash)"
            textAnchor="middle"
          >
            C
          </text>
        </svg>
        <span className="text-[#22D3EE] text-2xl font-museo font-bold">C-Lingo</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
          <span className="text-white font-bold text-sm">0</span>
          <span className="text-gray-400 text-xs">Aura</span>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
          <span className="text-white font-bold text-sm">0</span>
          <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3L4 14h7v7l9-11h-7V3z" />
          </svg>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="text-gray-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
};