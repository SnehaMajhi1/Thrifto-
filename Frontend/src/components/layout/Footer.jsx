import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Leaf className="h-6 w-6 text-primary-400" />
              <span className="text-lg font-bold text-white font-[var(--font-heading)]">
                Thrifto
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('footer.description', 'Sustainable fashion for a better tomorrow. Buy, sell, swap, and donate pre-loved clothing while earning EcoPoints.')}
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-[var(--font-body)]">
              {t('footer.explore', 'Explore')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/clothes" className="hover:text-primary-400 transition-colors">{t('nav.shop')}</Link></li>
              <li><Link to="/posts" className="hover:text-primary-400 transition-colors">{t('nav.community')}</Link></li>
              <li><Link to="/swaps" className="hover:text-primary-400 transition-colors">{t('nav.swaps')}</Link></li>
              <li><Link to="/donations" className="hover:text-primary-400 transition-colors">{t('nav.donate')}</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-[var(--font-body)]">
              {t('footer.account', 'Account')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="hover:text-primary-400 transition-colors">{t('footer.profile', 'Profile')}</Link></li>
              <li>
                <Link to="/help" className="hover:text-primary-400 transition-colors">
                  {t('footer.help', 'Help Center')}
                </Link>
              </li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">{t('nav.login')}</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">{t('nav.signup')}</Link></li>
            </ul>
          </div>

          {/* Sustainability */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-[var(--font-body)]">
              {t('footer.sustainability_title', 'Sustainability')}
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {t('footer.sustainability_desc', 'Every item re-used helps reduce textile waste. Join thousands choosing conscious fashion.')}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/login/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/accounts/login/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
          & {new Date().getFullYear()} Thrifto. Built for a sustainable future.
        </div>
      </div>
    </footer>
  );
}
