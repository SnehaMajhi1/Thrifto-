import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const toast = useToast();

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('thrifto_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save to local storage when cart changes
  useEffect(() => {
    localStorage.setItem('thrifto_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      // Check if item is already in cart
      if (prev.find((idx) => idx._id === item._id)) {
        toast.error('Item is already in your cart!');
        return prev;
      }
      toast.success('Added to cart!');
      return [...prev, item];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((idx) => idx._id !== itemId));
    toast.success('Removed from cart');
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
