import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import { CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { orderAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';


export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { clearCart } = useCart();
  const [processing, setProcessing] = useState(false);

  // Handle single item or multiple items from cart
  const items = location.state?.items || (location.state?.item ? [location.state.item] : []);
  
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-3">No Item Selected</h2>
        <Button onClick={() => navigate('/clothes')}>Browse Items</Button>
      </div>
    );
  }

  const totalPrice = items.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

  const handlePayNow = async () => {
    setProcessing(true);
    try {
      // Create orders for all items
      await Promise.all(items.map(item => orderAPI.create({ itemId: item._id })));
      
      toast.success('Payment successful! Your order(s) have been placed.');
      if (location.state?.items) clearCart();
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Cancel & Go Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
            <CreditCard className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Secure Checkout</h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item._id || idx} className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={item.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}`} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 capitalize">{item.condition} condition</p>
                </div>
                <div className="font-bold text-gray-900">₹{item.price}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({items.length} item{items.length > 1 ? 's' : ''})</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Platform Fee</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 mt-2 pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span className="text-primary-600">₹{totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handlePayNow} 
              loading={processing} 
              className="flex-1 py-3 text-lg"
            >
              <CheckCircle className="h-5 w-5 mr-2" /> Pay Now
            </Button>
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="flex-1 py-3"
              disabled={processing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
