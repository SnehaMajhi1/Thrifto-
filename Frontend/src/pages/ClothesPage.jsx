import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Plus, MapPin, Tag } from 'lucide-react';
import { clothesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import LoadingScreen from '../components/ui/LoadingScreen';
import EmptyState from '../components/ui/EmptyState';
import ClothesCard from '../components/clothes/ClothesCard';

const CATEGORIES = [
  { value: '', labelKey: 'all' },
  { value: 'tops', labelKey: 'tops' },
  { value: 'bottoms', labelKey: 'bottoms' },
  { value: 'dresses', labelKey: 'dresses' },
  { value: 'outerwear', labelKey: 'outerwear' },
  { value: 'shoes', labelKey: 'shoes' },
  { value: 'accessories', labelKey: 'accessories' },
  { value: 'other', labelKey: 'other' },
];

const LISTING_TYPES = [
  { value: '', labelKey: 'all_types' },
  { value: 'sell', labelKey: 'for_sale' },
  { value: 'swap', labelKey: 'for_swap' },
  { value: 'donate', labelKey: 'donations' },
];

const BADGE_VARIANT = {
  sell: 'primary',
  swap: 'accent',
  donate: 'success',
};

export default function ClothesPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [listingType, setListingType] = useState(searchParams.get('listingType') || '');
  const [showFilters, setShowFilters] = useState(false);

  const fetchItems = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (listingType) params.listingType = listingType;
      const res = await clothesAPI.getAll(params);
      setItems(res.data.data);
      setPagination(res.data.pagination);

      // Sync URL
      const sp = new URLSearchParams();
      if (search.trim()) sp.set('search', search.trim());
      if (category) sp.set('category', category);
      if (listingType) sp.set('listingType', listingType);
      if (page > 1) sp.set('page', page);
      setSearchParams(sp, { replace: true });

      if (isAuthenticated && !search.trim() && !category && !listingType && page === 1) {
        Promise.all([
          clothesAPI.getRecommended({ limit: 4 }).catch(() => ({ data: { data: [] } })),
          clothesAPI.getNearby({ limit: 4 }).catch(() => ({ data: { data: [] } }))
        ]).then(([recRes, nearRes]) => {
          setRecommended(recRes.data.data);
          setNearby(nearRes.data.data);
        });
      } else {
        setRecommended([]);
        setNearby([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(parseInt(searchParams.get('page')) || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, listingType]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('shop.title')}</h1>
          <p className="text-gray-500 mt-1">{t('shop.subtitle')}</p>
        </div>
        {isAuthenticated && (
          <Link to="/clothes/new">
            <Button>
              <Plus className="h-4 w-4" />
              {t('common.add_new', 'List Item')}
            </Button>
          </Link>
        )}
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('shop.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            {t('shop.search_button')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {t('shop.filters_button')}
          </Button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{t(`categories.${c.labelKey}`)}</option>
              ))}
            </select>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {LISTING_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{t(`shop.${type.labelKey}`)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Items Grid */}
      {loading ? (
        <LoadingScreen message="Finding clothes..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No clothes found"
          description="Try adjusting your search or filters, or list your first item!"
        >
          {isAuthenticated && (
            <Link to="/clothes/new">
              <Button size="sm">
                <Plus className="h-4 w-4" /> List Item
              </Button>
            </Link>
          )}
        </EmptyState>
      ) : (
        <>
          {recommended.length > 0 && (
            <div className="mb-10 animate-fade-in">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900"><Tag className="w-5 h-5 text-accent-500"/> Recommended for you</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {recommended.map((item) => <ClothesCard key={item._id} item={item} />)}
              </div>
            </div>
          )}

          {nearby.length > 0 && (
            <div className="mb-10 animate-fade-in">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900"><MapPin className="w-5 h-5 text-primary-500"/> Nearby Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {nearby.map((item) => <ClothesCard key={item._id} item={item} />)}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">All Listings</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((item) => (
              <ClothesCard key={item._id} item={item} />
            ))}
          </div>


          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(p) => fetchItems(p)}
          />
        </>
      )}
    </div>
  );
}
