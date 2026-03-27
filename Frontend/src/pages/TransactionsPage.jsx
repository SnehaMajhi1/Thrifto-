import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeftRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { orderAPI, swapAPI } from '../services/api';
import Badge from '../components/ui/Badge';
import LoadingScreen from '../components/ui/LoadingScreen';

export default function TransactionsPage() {
  const [orders, setOrders] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, swapsRes] = await Promise.all([
          orderAPI.getAll(),
          swapAPI.getAll()
        ]);
        setOrders(ordersRes.data.data);
        setSwaps(swapsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingScreen message="Loading history..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h1>
      
      <div className="flex gap-4 mb-8 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-4 px-2 text-sm font-bold transition-all ${activeTab === 'orders' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          My Orders
        </button>
        <button 
          onClick={() => setActiveTab('swaps')}
          className={`pb-4 px-2 text-sm font-bold transition-all ${activeTab === 'swaps' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Swap Requests
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'orders' ? (
          orders.length > 0 ? orders.map(order => (
            <div key={order._id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{order.item?.title || 'Unknown Item'}</h3>
                  <p className="text-sm text-gray-500">₹{order.totalAmount} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <Badge variant="success">{order.orderStatus}</Badge>
            </div>
          )) : <p className="text-center py-12 text-gray-500">No orders yet.</p>
        ) : (
          swaps.length > 0 ? swaps.map(swap => (
            <div key={swap._id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent-50 rounded-xl text-accent-600">
                  <ArrowLeftRight className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Exchange for {swap.offeredItem?.title || 'Unknown Item'}</h3>
                  <p className="text-sm text-gray-500">{new Date(swap.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {swap.status === 'pending' && <Clock className="h-4 w-4 text-amber-500" />}
                {swap.status === 'accepted' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                {swap.status === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                <Badge variant={swap.status === 'accepted' ? 'success' : swap.status === 'rejected' ? 'danger' : 'default'}>
                  {swap.status}
                </Badge>
              </div>
            </div>
          )) : <p className="text-center py-12 text-gray-500">No swap requests yet.</p>
        )}
      </div>
    </div>
  );
}
