import { useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../../lib/authSession';
import { routes } from '../../lib/constants';
import { notification } from '../../lib/notifications';

export const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await notification.confirm({
      title: 'Sign out?',
      message: 'You will need to sign in again to access your dashboard.',
      variant: 'warning',
      confirmText: 'Sign Out',
      cancelText: 'Stay',
    });

    if (!result.isConfirmed) {
      return;
    }

    clearAuthSession();
    navigate(routes.signIn, { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 bg-clingo-dark/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00B4D8" />
                <stop offset="100%" stopColor="#0096B7" />
              </linearGradient>
            </defs>
            <text x="50" y="72" fontSize="65" fontWeight="bold" fontFamily="'MuseoModerno', cursive, sans-serif" fill="url(#cGradientHeader)" textAnchor="middle">C</text>
          </svg>
        </div>
        <span className="text-clingo-blue text-2xl font-museo font-bold">C-Lingo</span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex space-x-3">
          <div className="bg-white rounded-full px-4 py-1 flex items-center space-x-2 border border-clingo-blue/30 cursor-pointer">
            <span className="text-xs font-bold text-red-500 uppercase font-poppins">12 Aura</span>
          </div>
          <div className="bg-white rounded-full px-4 py-1 flex items-center space-x-2 border border-clingo-blue/30 cursor-pointer">
            <span className="text-xs font-bold text-clingo-blue uppercase font-poppins">100</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M13 3L4 14h7v7l9-11h-7V3z" fill="#FFD700" /></svg>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-gray-300 hover:text-clingo-blue transition cursor-pointer font-poppins"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
