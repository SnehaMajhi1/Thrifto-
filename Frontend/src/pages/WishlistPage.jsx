import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { Heart, ShoppingBag } from 'lucide-react';
import ClothesCard from '../components/clothes/ClothesCard';
import LoadingScreen from '../components/ui/LoadingScreen';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchWishlist = async () => {
    try {
      const res = await userAPI.getWishlist();
      setWishlist(res.data.data);
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <Heart className="h-8 w-8 text-red-500 fill-current" />
        My Wishlist
      </h1>

      {wishlist.length === 0 ? (
        <EmptyState 
          icon={Heart} 
          title="Your wishlist is empty" 
          description="Like items to save them for later." 
          actionLabel="Go Shopping"
          onAction={() => window.location.href = '/clothes'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <ClothesCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
