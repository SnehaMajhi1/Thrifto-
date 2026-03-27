import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  MapPin,
  Eye,
  Tag,
  Clock,
  MessageSquare,
  Trash2,
  Edit,
  User,
  ShoppingBag,
  Star,
  Heart,
  Flag,
  ArrowLeftRight,
} from 'lucide-react';
import { clothesAPI, chatAPI, userAPI, reviewAPI, reportAPI, swapAPI } from '../services/api';

import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingScreen from '../components/ui/LoadingScreen';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';

const BADGE_VARIANT = {
  sell: 'primary',
  swap: 'accent',
  donate: 'success',
  auction: 'warning',
};


export default function ClothesDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const [showSwap, setShowSwap] = useState(false);
  const [swapForm, setSwapForm] = useState({ message: '', location: '' });
  const [swapLoading, setSwapLoading] = useState(false);
  const [myItems, setMyItems] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, fetch the item details
        const res = await clothesAPI.getOne(id);
        const itemData = res.data.data;
        setItem(itemData);

        // Then fetch seller's reviews (non-blocking - don't let this crash the page)
        if (itemData.seller?._id) {
          try {
            const sRes = await reviewAPI.getUserReviews(itemData.seller._id);
            setReviews(sRes.data.data || []);
          } catch {
            // Reviews failed to load - not critical, just show empty
            setReviews([]);
          }
        }

        // Fetch wishlist status if authenticated
        if (isAuthenticated) {
          try {
            const wishRes = await userAPI.getWishlist();
            setInWishlist(wishRes.data.data.some(w => w._id === id));
          } catch {
            // Wishlist check failed - not critical
          }
        }
      } catch {
        toast.error('Item not found');
        navigate('/clothes');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    if (isAuthenticated) {
      clothesAPI.getAll({ seller: user?._id, listingType: 'swap', status: 'available' })
        .then(res => setMyItems(res.data.data))
        .catch(() => {});
    }
  }, [id, navigate, toast, isAuthenticated, user?._id]);


  const isOwner = user && item?.seller?._id === user._id;

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return;
    setDeleting(true);
    try {
      await clothesAPI.remove(id);
      toast.success('Listing deleted');
      navigate('/clothes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(item);
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      await userAPI.toggleWishlist(id);
      setInWishlist(!inWishlist);
      toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated) return navigate('/login');
    const reason = prompt('Why are you reporting this item?');
    if (!reason) return;
    try {
      await reportAPI.create({ 
        targetType: 'item', 
        targetId: id, 
        reason 
      });
      toast.success('Report submitted to admins');
    } catch (err) {
      toast.error('Failed to submit report');
    }
  };


  const handleRate = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (rating === 0) return toast.error('Please select a rating');
    try {
      await reviewAPI.create({ 
        reviewedUserId: item.seller._id, 
        rating, 
        comment: comment || `Rated ${item.title}` 
      });
      toast.success('Review submitted!');
      setComment('');
      // Refresh reviews
      const sRes = await reviewAPI.getUserReviews(item.seller._id);
      setReviews(sRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };


  const handleCreateSwap = async (e) => {
    e.preventDefault();
    if (!myItems.length) {
      toast.error('You need to have at least one of your own items listed for swap.');
      return;
    }
    setSwapLoading(true);
    try {
      const selectedItem = myItems[0]; 
      await swapAPI.create({
        requestedFrom: item.seller._id,
        requestedItems: [id],
        offeredItems: [selectedItem._id],
        message: swapForm.message,
        meetupDetails: { location: swapForm.location }
      });
      toast.success('Swap request sent!');
      setShowSwap(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send swap request');
    } finally {
      setSwapLoading(false);
    }
  };



  if (loading) return <LoadingScreen />;
  if (!item) return null;

  const images = item.images?.length > 0
    ? item.images
    : [`https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=d1fae5&color=065f46&size=400`];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
            <img
              src={images[activeImage]}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=d1fae5&color=065f46&size=400`;
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer ${
                    i === activeImage ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{item.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={BADGE_VARIANT[item.listingType] || 'default'}>
                {item.listingType}
              </Badge>
              <button 
                onClick={handleToggleWishlist}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  inWishlist ? 'bg-red-50 border-red-100 text-red-500' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-red-400'
                }`}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>


          <div className="flex flex-col gap-3 mb-6 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <p className="text-sm font-bold text-gray-700">Rate this Seller</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)} 
                  className="text-yellow-400 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star className={`h-6 w-6 ${rating >= star ? 'fill-current' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a quick review..."
              className="w-full text-sm border border-gray-100 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none h-20 bg-gray-50/50"
            />
            <Button onClick={handleRate} variant="secondary" size="sm" className="w-fit">Submit Review</Button>
          </div>


          <p className="text-3xl font-bold text-primary-600 mb-6">
            {item.listingType === 'donate' ? 'Free' : `₹${item.price}`}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1">
              <Tag className="h-4 w-4" /> {t(`categories.${item.category}`)}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">{t('donate.condition')}:</span> {t(`conditions.${item.condition}`)}
            </span>
            {item.size && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Size:</span> {item.size}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> {item.views || 0} views
            </span>
            {item.location?.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {item.location.city}{item.location.state ? `, ${item.location.state}` : ''}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 font-[var(--font-body)]">Description</h3>
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="default">#{tag}</Badge>
              ))}
            </div>
          )}

          {/* Auction info */}
          {item.listingType === 'auction' && item.auctionEndDate && (
            <div className="bg-accent-50 rounded-xl p-4 mb-6 flex items-center gap-2 text-sm text-accent-700">
              <Clock className="h-5 w-5" />
              Auction ends: {new Date(item.auctionEndDate).toLocaleDateString()}
            </div>
          )}

          {/* Seller info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.seller?.name || 'Unknown seller'}
                </p>
                <p className="text-xs text-gray-500">
                  Listed {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              {!isOwner && (
                <button 
                  onClick={handleReport}
                  className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Flag className="h-3 w-3" /> Report
                </button>
              )}
            </div>
          </div>


          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isOwner ? (
              <div className="flex gap-3">
                <Link to={`/clothes/${id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full text-sm">
                    <Edit className="h-4 w-4" /> {t('common.edit')}
                  </Button>
                </Link>
                <Button variant="danger" onClick={handleDelete} loading={deleting} className="text-sm">
                  <Trash2 className="h-4 w-4" /> {t('common.delete')}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <Button onClick={handleAddToCart} variant="outline" className="flex-1 text-sm">
                    <ShoppingBag className="h-4 w-4" /> {t('shop.add_to_cart')}
                  </Button>
                  <Button onClick={() => navigate('/payment', { state: { item } })} className="flex-1 text-sm">
                    {t('shop.buy_now')}
                  </Button>
                </div>
                {item?.listingType === 'swap' && (
                  <Button 
                    onClick={() => setShowSwap(true)} 
                    variant="accent" 
                    className="w-full text-sm"
                  >
                    <ArrowLeftRight className="h-4 w-4" /> {t('shop.for_swap')}
                  </Button>
                )}
                <Button
                  onClick={async () => {
                    if (!isAuthenticated) {
                      toast.error('Please log in to message the seller');
                      navigate('/login');
                      return;
                    }
                    try {
                      const res = await chatAPI.create({ 
                        participantId: item.seller._id,
                        relatedItem: item._id 
                      });
                      navigate(`/chats/${res.data.data._id}`);
                    } catch (err) {
                      toast.error('Failed to start chat');
                    }
                  }}
                  variant="secondary"
                  className="w-full text-sm"
                >
                  <MessageSquare className="h-4 w-4" /> {t('common.message')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 pt-8 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Seller Reviews</h2>
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r._id} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{r.reviewer?.name}</span>
                </div>
                <p className="text-sm text-gray-600 italic">"{r.comment}"</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No reviews yet for this seller.</p>
        )}
      </div>

      {/* Swap Modal */}
      <Modal 
        isOpen={showSwap} 
        onClose={() => setShowSwap(false)} 
        title="Propose a Swap"
      >
        <form onSubmit={handleCreateSwap} className="space-y-4">
          <div className="p-4 bg-primary-50 rounded-xl flex gap-3 text-sm text-primary-700">
            <ArrowLeftRight className="h-5 w-5 shrink-0" />
            <p>You are requesting to swap your item for <strong>{item.title}</strong>.</p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Choose your item to offer *</label>
            {myItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {myItems.map(my => (
                  <button
                    key={my._id}
                    type="button"
                    className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 hover:border-primary-500 transition-all text-left"
                  >
                    <img src={my.images?.[0]} alt="" className="w-10 h-10 object-cover rounded" />
                    <span className="text-sm font-medium">{my.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-red-500">No items available for swap. List an item as 'For Swap' first.</p>
            )}
          </div>

          <Textarea 
            label="Message" 
            placeholder="Hi, I'm interested in swapping my item for yours!"
            value={swapForm.message}
            onChange={e => setSwapForm({ ...swapForm, message: e.target.value })}
          />
          <Input 
            label="Meetup Location" 
            placeholder="e.g. Near the central mall"
            value={swapForm.location}
            onChange={e => setSwapForm({ ...swapForm, location: e.target.value })}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={swapLoading} className="flex-1" disabled={!myItems.length}>
              Send Swap Request
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowSwap(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

