import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import {
  Menu,
  X,
  Leaf,
  MessageSquare,
  User,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  LogIn,
  UserPlus,
  Bell,
  Heart
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { notificationAPI } from '../../services/api';

const NAV_LINKS = [
  { to: '/clothes', labelKey: 'shop', label: 'Shop' },
  { to: '/posts', labelKey: 'community', label: 'Community' },
  { to: '/swaps', labelKey: 'swaps', label: 'Swaps' },
  { to: '/donations', labelKey: 'donate', label: 'Donate' },
  { to: '/profile', labelKey: 'dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchUnread = async () => {
      try {
        const res = await notificationAPI.getAll();
        const unread = res.data.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Failed to fetch notifications');
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 flex flex-col shadow-md">
      {/* Top Banner */}
      <div className="bg-emerald-50 text-emerald-900 text-xs sm:text-sm flex items-center justify-center gap-1.5 py-2 font-medium tracking-wide border-b-2 border-emerald-400 shadow-sm">
        <Leaf className="h-4 w-4" />
        {t('banner')}
      </div>

      {/* Main Navbar */}
      <nav className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Logo */}
            <div className="flex-1 flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <Leaf className="h-7 w-7 text-yellow-100 group-hover:text-white transition-colors duration-300" />
                <span className="text-2xl font-bold tracking-tight text-white font-[var(--font-heading)] drop-shadow-sm">
                  Thrifto
                </span>
              </Link>
            </div>

            {/* Center: Desktop Links */}
            <div className="hidden md:flex flex-1 justify-center items-center gap-8">
              {NAV_LINKS.map(({ to, labelKey }) => (
                <Link
                  key={to}
                  to={to}
                  className={`relative group px-1 py-1 text-sm font-semibold tracking-wide transition-colors duration-300 ${
                    isActive(to) ? 'text-yellow-100' : 'text-emerald-50 hover:text-white'
                  }`}
                >
                  {t(`nav.${labelKey}`)}
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] rounded-full transition-all duration-300 ${
                      isActive(to) ? 'w-full bg-yellow-200' : 'w-0 bg-yellow-200 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
              ))}
            </div>

            {/* Right: Desktop Icons */}
            <div className="hidden md:flex flex-1 items-center justify-end gap-2">
              
              {/* Language Switcher */}
              <div className="flex items-center gap-1.5 mr-3 border-r border-emerald-400/30 pr-3">
                <button 
                  onClick={() => changeLanguage('en')} 
                  className={`hover:scale-110 transition-transform ${i18n.language?.startsWith('en') ? 'ring-2 ring-yellow-400 p-0.5 rounded-sm' : 'opacity-60 hover:opacity-100'}`}
                  title="English"
                >
                  <img src="https://flagcdn.com/w40/gb.png" alt="UK" className="w-6 h-auto shadow-sm" />
                </button>
                <button 
                  onClick={() => changeLanguage('ne')} 
                  className={`hover:scale-110 transition-transform ${i18n.language?.startsWith('ne') ? 'ring-2 ring-yellow-400 p-0.5 rounded-sm' : 'opacity-60 hover:opacity-100'}`}
                  title="Nepali"
                >
                  <img src="https://flagcdn.com/w40/np.png" alt="Nepal" className="w-6 h-auto shadow-sm" />
                </button>
              </div>

              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="p-2 rounded-full text-emerald-50 hover:bg-white/20 hover:text-yellow-100 transition-all duration-300"
                      title="Admin Dashboard"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                    </Link>
                  )}
                  <Link
                    to="/notifications"
                    className="relative p-2 rounded-full text-emerald-50 hover:bg-white/20 hover:text-yellow-100 transition-all duration-300"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-yellow-400 text-emerald-900 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm transform translate-x-1/4 -translate-y-1/4 border-2 border-emerald-500">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/wishlist"
                    className="p-2 rounded-full text-emerald-50 hover:bg-white/20 hover:text-yellow-100 transition-all duration-300"
                    title="Wishlist"
                  >
                    <Heart className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/cart"
                    className="relative p-2 rounded-full text-emerald-50 hover:bg-white/20 hover:text-yellow-100 transition-all duration-300"
                    title="Cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cart.length > 0 && (
                      <span className="absolute top-0 right-0 bg-yellow-400 text-emerald-900 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm transform translate-x-1/4 -translate-y-1/4 border-2 border-emerald-500">
                        {cart.length}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/chats"
                    className="p-2 rounded-full text-emerald-50 hover:bg-white/20 hover:text-yellow-100 transition-all duration-300"
                    title="Messages"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/profile"
                    className="p-2 rounded-full text-emerald-50 hover:bg-white/20 hover:text-yellow-100 transition-all duration-300"
                    title="Profile"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full text-emerald-50 hover:bg-red-500/80 hover:text-white transition-all duration-300 cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-emerald-50 border border-emerald-300/50 rounded-full hover:bg-white/10 hover:border-white transition-all duration-300"
                  >
                    <LogIn className="h-4 w-4" />
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-emerald-700 bg-yellow-100 rounded-full shadow-sm hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <UserPlus className="h-4 w-4" />
                    {t('nav.signup')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden flex items-center gap-3">
              {isAuthenticated && (
                <Link to="/cart" className="relative p-2 text-emerald-50 hover:text-white">
                  <ShoppingCart className="h-6 w-6" />
                  {cart.length > 0 && (
                    <span className="absolute top-0 right-0 bg-yellow-400 text-emerald-900 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold transform translate-x-1/4 -translate-y-1/4 border border-emerald-500">
                      {cart.length}
                    </span>
                  )}
                </Link>
              )}
              <button
                className="p-2 rounded-lg text-emerald-50 hover:bg-white/20 cursor-pointer transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-emerald-700 border-t border-emerald-600 animate-fade-in shadow-inner">
            <div className="px-4 py-4 space-y-2">
              <div className="flex items-center justify-center gap-4 pb-4 border-b border-emerald-600/50 mb-2">
                <button 
                  onClick={() => { changeLanguage('en'); setMobileOpen(false); }} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${i18n.language?.startsWith('en') ? 'bg-emerald-800 text-yellow-100 ring-1 ring-yellow-400' : 'text-emerald-50 bg-white/5'}`}
                >
                  <img src="https://flagcdn.com/w40/gb.png" alt="UK" className="w-5 h-auto mr-1" />
                  English
                </button>
                <button 
                  onClick={() => { changeLanguage('ne'); setMobileOpen(false); }} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${i18n.language?.startsWith('ne') ? 'bg-emerald-800 text-yellow-100 ring-1 ring-yellow-400' : 'text-emerald-50 bg-white/5'}`}
                >
                  <img src="https://flagcdn.com/w40/np.png" alt="Nepal" className="w-5 h-auto mr-1" />
                  Nepali
                </button>
              </div>

              {NAV_LINKS.map(({ to, labelKey }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActive(to)
                      ? 'bg-emerald-800 text-yellow-100 shadow-sm'
                      : 'text-emerald-50 hover:bg-white/10'
                  }`}
                >
                  {t(`nav.${labelKey}`)}
                </Link>
              ))}
              
              <div className="h-px bg-emerald-600/50 my-4"></div>

              {isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-emerald-50 bg-white/5 hover:bg-white/10"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-emerald-50 bg-white/5 hover:bg-white/10"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/chats"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-emerald-50 bg-white/5 hover:bg-white/10"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-emerald-50 bg-white/5 hover:bg-white/10"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-500/20 hover:bg-red-500/40 w-full col-span-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold text-emerald-50 border-2 border-emerald-400/50 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <LogIn className="h-5 w-5" />
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold text-emerald-800 bg-yellow-100 rounded-xl hover:bg-white hover:shadow-lg transition-all"
                  >
                    <UserPlus className="h-5 w-5" />
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
