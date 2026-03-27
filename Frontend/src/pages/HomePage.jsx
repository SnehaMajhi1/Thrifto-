import { Link } from 'react-router-dom';
import {
  Leaf,
  ShoppingBag,
  ArrowLeftRight,
  Heart,
  Award,
  Recycle,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

const FEATURES = [
  {
    icon: ShoppingBag,
    titleKey: 'eco_marketplace',
    color: 'bg-primary-100 text-primary-700',
    link: '/clothes',
  },
  {
    icon: ArrowLeftRight,
    titleKey: 'clothes_swap',
    color: 'bg-blue-100 text-blue-700',
    link: '/swaps',
  },
  {
    icon: Heart,
    titleKey: 'donate',
    color: 'bg-pink-100 text-pink-700',
    link: '/donations',
  },
  {
    icon: Award,
    titleKey: 'rewards',
    color: 'bg-accent-100 text-accent-700',
    link: '/profile',
  },
];

const STATS = [
  { value: '10K+', labelKey: 'items_listed', icon: ShoppingBag },
  { value: '5K+', labelKey: 'swaps_made', icon: ArrowLeftRight },
  { value: '3K+', labelKey: 'donations', icon: Heart },
  { value: '50K+', labelKey: 'ecopoints', icon: TrendingUp },
];

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">

            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 animate-fade-in">
              {t('home.hero_title_1')}
              <span className="text-primary-600">{t('home.hero_title_2')}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 animate-fade-in font-[var(--font-body)]">
              {t('home.hero_desc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link to="/clothes">
                <Button size="lg" className="w-full sm:w-auto">
                  <ShoppingBag className="h-5 w-5" />
                  {t('home.browse_clothes')}
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t('home.join_thrifto')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl" />
      </section>

      {/* Stats Strip */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(({ value, labelKey, icon: Icon }) => (
              <div key={labelKey} className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Icon className="h-5 w-5 text-primary-500" />
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">{value}</span>
                </div>
                <p className="text-sm text-gray-500">{t(`home.stats.${labelKey}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {t('home.how_it_works')}
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto font-[var(--font-body)]">
              {t('home.how_it_works_desc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, titleKey, color, link }) => (
              <Link
                key={titleKey}
                to={link}
                className="group bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-[var(--font-body)]">
                  {t(`home.features.${titleKey}`)}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t(`home.features.${titleKey}_desc`)}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">
                  {t('home.explore')} <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Recycle className="h-12 w-12 text-primary-200 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('home.cta_title')}
          </h2>
          <p className="text-primary-100 text-lg mb-8 font-[var(--font-body)]">
            {t('home.cta_desc')}
          </p>
          <Link to="/register">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary-700 hover:bg-primary-50"
            >
              {t('home.get_started')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
