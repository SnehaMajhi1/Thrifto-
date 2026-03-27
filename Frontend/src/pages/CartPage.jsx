import { useCart } from '../contexts/CartContext';
import { ShoppingBag, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CartPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cart, removeFromCart, clearCart } = useCart();
  
  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState 
          icon={ShoppingBag} 
          title={t('cart.empty_title')} 
          description={t('cart.empty_desc')} 
        />
      </div>
    );
  }

  const total = cart.reduce((acc, item) => acc + (item.listingType === 'donate' ? 0 : Number(item.price || 0)), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.title')}</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {cart.map((item) => (
            <li key={item._id} className="p-4 sm:p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  <img 
                    src={item.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}`} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                  <p className="text-primary-600 font-medium">
                    {item.listingType === 'donate' ? 'Free' : `₹${item.price}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => removeFromCart(item._id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove from cart"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={clearCart}>{t('cart.clear_cart')}</Button>
            <Button onClick={() => navigate('/payment', { state: { items: cart } })}>{t('cart.proceed_checkout')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
