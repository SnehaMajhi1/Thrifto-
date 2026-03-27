import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Plus, Package, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { donationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import LoadingScreen from '../components/ui/LoadingScreen';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';

const STATUS_BADGE = {
  pending: 'warning',
  approved: 'primary',
  collected: 'accent',
  completed: 'success',
  cancelled: 'danger',
};

const ITEM_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

export default function DonationsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();

  const [donations, setDonations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  const [form, setForm] = useState({
    itemTitle: '',
    itemDescription: '',
    itemCategory: '',
    itemCondition: 'good',
    itemQuantity: '1',
    address: '',
    city: '',
    state: '',
    notes: '',
  });

  const fetchDonations = async (page = 1) => {
    setLoading(true);
    try {
      const res = await donationAPI.getAll({ page, limit: 10 });
      setDonations(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.itemTitle.trim()) {
      toast.error('Item title is required');
      return;
    }
    setCreateLoading(true);
    try {
      const formData = new FormData();
      const items = [
        {
          title: form.itemTitle.trim(),
          description: form.itemDescription.trim() || undefined,
          category: form.itemCategory.trim() || undefined,
          condition: form.itemCondition,
          quantity: parseInt(form.itemQuantity) || 1,
        },
      ];
      formData.append('items', JSON.stringify(items));

      const pickupLocation = {};
      if (form.address) pickupLocation.address = form.address;
      if (form.city) pickupLocation.city = form.city;
      if (form.state) pickupLocation.state = form.state;
      
      if (Object.keys(pickupLocation).length > 0) {
        formData.append('pickupLocation', JSON.stringify(pickupLocation));
      }

      if (form.notes.trim()) formData.append('notes', form.notes.trim());

      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      await donationAPI.create(formData);
      toast.success('Donation submitted! Earn EcoPoints once completed.');
      setShowCreate(false);
      setImageFiles([]);
      setForm({
        itemTitle: '', itemDescription: '', itemCategory: '', itemCondition: 'good',
        itemQuantity: '1', address: '', city: '', state: '', notes: '',
      });
      fetchDonations(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create donation');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('donate.title')}</h1>
          <p className="text-gray-500 mt-1">{t('donate.subtitle')}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> {t('nav.donate')}
        </Button>
      </div>

      {/* Info banner */}
      <div className="bg-gradient-to-r from-pink-50 to-primary-50 rounded-xl p-5 mb-6 flex items-start gap-3">
        <Heart className="h-6 w-6 text-pink-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-800">Every donation makes a difference</p>
          <p className="text-xs text-gray-500 mt-1">
            Earn EcoPoints for every completed donation. Points are awarded once an admin marks your donation as completed.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingScreen message="Loading donations..." />
      ) : donations.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No donations yet"
          description="Start giving your pre-loved clothes a new purpose!"
        />
      ) : (
        <div className="space-y-4">
          {donations.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">
                      {d.items?.map((i) => i.title).join(', ') || 'Donation'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(d.createdAt).toLocaleDateString()} · {d.items?.length || 0} item(s)
                  </p>
                </div>
                <Badge variant={STATUS_BADGE[d.status]}>{d.status}</Badge>
              </div>

              {d.notes && (
                <p className="text-sm text-gray-600 mb-2">{d.notes}</p>
              )}

              {d.pickupLocation?.city && (
                <p className="text-xs text-gray-400">
                  Pickup: {[d.pickupLocation.address, d.pickupLocation.city, d.pickupLocation.state]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}

              {d.ecoPointsAwarded > 0 && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-primary-600 font-medium">
                  +{d.ecoPointsAwarded} EcoPoints earned!
                </div>
              )}
            </div>
          ))}

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(p) => fetchDonations(p)}
          />
        </div>
      )}

      {/* Create Donation Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Donate Clothes" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Item Title *"
            placeholder="e.g. Summer dress collection"
            value={form.itemTitle}
            onChange={(e) => setForm({ ...form, itemTitle: e.target.value })}
          />
          <Textarea
            label="Description"
            placeholder="Describe the item(s) you're donating..."
            value={form.itemDescription}
            onChange={(e) => setForm({ ...form, itemDescription: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Category"
              placeholder="e.g. tops"
              value={form.itemCategory}
              onChange={(e) => setForm({ ...form, itemCategory: e.target.value })}
            />
            <Select
              label="Condition"
              options={ITEM_CONDITIONS}
              value={form.itemCondition}
              onChange={(e) => setForm({ ...form, itemCondition: e.target.value })}
            />
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={form.itemQuantity}
              onChange={(e) => setForm({ ...form, itemQuantity: e.target.value })}
            />
          </div>

          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider pt-2">
            Pickup Location
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Address"
              placeholder="Street address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <Input
              label="City"
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="State"
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-sm font-semibold text-gray-700">Images</label>
            <div className="group relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImageFiles(Array.from(e.target.files))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full px-4 py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl group-hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-2">
                <div className="p-2 rounded-full bg-white shadow-sm">
                  <Plus className="h-5 w-5 text-gray-400 group-hover:text-primary-500" />
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
              </div>
            </div>

            {imageFiles.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                {imageFiles.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white text-red-500 shadow-sm cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Textarea
            label="Additional Notes"
            placeholder="Any special instructions for pickup..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={createLoading} className="flex-1">
              Submit Donation
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
