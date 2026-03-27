import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Plus, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import { swapAPI } from '../services/api';
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

const STATUS_BADGE = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'danger',
  completed: 'primary',
  cancelled: 'default',
};

export default function SwapsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [swaps, setSwaps] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form, setForm] = useState({
    requestedFrom: '',
    offeredItems: '',
    requestedItems: '',
    message: '',
    location: '',
  });

  const fetchSwaps = async (page = 1) => {
    setLoading(true);
    try {
      const res = await swapAPI.getAll({ page, limit: 10 });
      setSwaps(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setSwaps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.requestedFrom || !form.offeredItems || !form.requestedItems) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCreateLoading(true);
    try {
      const body = {
        requestedFrom: form.requestedFrom.trim(),
        offeredItems: form.offeredItems.split(',').map((s) => s.trim()).filter(Boolean),
        requestedItems: form.requestedItems.split(',').map((s) => s.trim()).filter(Boolean),
      };
      if (form.message.trim()) body.message = form.message.trim();
      if (form.location.trim()) {
        body.meetupDetails = { location: form.location.trim() };
      }
      await swapAPI.create(body);
      toast.success('Swap request sent!');
      setShowCreate(false);
      setForm({ requestedFrom: '', offeredItems: '', requestedItems: '', message: '', location: '' });
      fetchSwaps(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create swap');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRespond = async (swapId, status) => {
    try {
      await swapAPI.respond(swapId, { status });
      toast.success(`Swap ${status}`);
      fetchSwaps(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clothes Swaps</h1>
          <p className="text-gray-500 mt-1">Exchange items with other members</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Swap
        </Button>
      </div>

      {loading ? (
        <LoadingScreen message="Loading swaps..." />
      ) : swaps.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No swaps yet"
          description="Start by creating a swap request or listing items for swap in the marketplace."
        >
          <Link to="/clothes">
            <Button variant="outline" size="sm">Browse Items</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {swaps.map((swap) => {
            const isRequester = swap.requester?._id === user?._id;
            const isRequestedFrom = swap.requestedFrom?._id === user?._id;
            return (
              <div
                key={swap._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {isRequester
                          ? `You → ${swap.requestedFrom?.name || 'User'}`
                          : `${swap.requester?.name || 'User'} → You`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(swap.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={STATUS_BADGE[swap.status]}>{swap.status}</Badge>
                </div>

                {swap.message && (
                  <p className="text-sm text-gray-600 mb-3 italic">&ldquo;{swap.message}&rdquo;</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-3">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Offered Items</p>
                    {swap.offeredItems?.map((item) => (
                      <p key={item._id || item}>
                        {item.title || item._id || item}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Requested Items</p>
                    {swap.requestedItems?.map((item) => (
                      <p key={item._id || item}>
                        {item.title || item._id || item}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Action buttons for recipient */}
                {swap.status === 'pending' && isRequestedFrom && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Button
                      size="sm"
                      onClick={() => handleRespond(swap._id, 'accepted')}
                    >
                      <CheckCircle className="h-4 w-4" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRespond(swap._id, 'rejected')}
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}

                {swap.status === 'accepted' && (isRequester || isRequestedFrom) && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Button
                      size="sm"
                      onClick={() => handleRespond(swap._id, 'completed')}
                    >
                      <CheckCircle className="h-4 w-4" /> Mark Completed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespond(swap._id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(p) => fetchSwaps(p)}
          />
        </div>
      )}

      {/* Create Swap Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Swap Request">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="User ID to swap with *"
            placeholder="Paste the user's ID"
            value={form.requestedFrom}
            onChange={(e) => setForm({ ...form, requestedFrom: e.target.value })}
          />
          <Input
            label="Your Item IDs (comma-separated) *"
            placeholder="item_id_1, item_id_2"
            value={form.offeredItems}
            onChange={(e) => setForm({ ...form, offeredItems: e.target.value })}
          />
          <Input
            label="Requested Item IDs (comma-separated) *"
            placeholder="item_id_1, item_id_2"
            value={form.requestedItems}
            onChange={(e) => setForm({ ...form, requestedItems: e.target.value })}
          />
          <Textarea
            label="Message"
            placeholder="Hi! I'd love to swap these items..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <Input
            label="Meetup Location"
            placeholder="e.g. Central Park"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={createLoading} className="flex-1">
              Send Swap Request
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
