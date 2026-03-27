import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, ExternalLink, Plus, Loader2 } from 'lucide-react';
import { clothesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function MyListings() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyItems = async () => {
    try {
      const res = await clothesAPI.getAll({ seller: user._id });
      setItems(res.data.data);
    } catch {
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchMyItems();
  }, [user?._id]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await clothesAPI.remove(id);
      toast.success('Listing deleted');
      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-500 mb-4">You haven't listed any clothes yet.</p>
        <Link to="/clothes/new">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Start Selling
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">My Listings ({items.length})</h3>
        <Link to="/clothes/new">
          <Button size="xs" variant="outline">
            <Plus className="h-3 w-3" /> Add New
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {items.map((item) => (
          <div key={item._id} className="bg-white p-3 rounded-xl border border-gray-200 flex gap-4 items-center hover:shadow-sm transition-shadow">
            <img 
              src={item.images?.[0] || 'https://via.placeholder.com/100'} 
              alt={item.title} 
              className="w-16 h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-primary-600">
                  {item.listingType === 'donate' ? 'Free' : `₹${item.price}`}
                </span>
                <Badge variant="default" className="text-[10px] py-0 px-1.5 capitalize">{item.listingType}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/clothes/${item._id}`} className="p-2 text-gray-400 hover:text-primary-600 bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors">
                <ExternalLink className="h-4 w-4" />
              </Link>
              <Link to={`/clothes/${item._id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit className="h-4 w-4" />
              </Link>
              <button 
                onClick={() => handleDelete(item._id)}
                className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
