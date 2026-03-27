import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { CartProvider } from './contexts/CartContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClothesPage from './pages/ClothesPage';
import ClothesDetailPage from './pages/ClothesDetailPage';
import ClothesFormPage from './pages/ClothesFormPage';
import PostsPage from './pages/PostsPage';
import SwapsPage from './pages/SwapsPage';
import DonationsPage from './pages/DonationsPage';
import CartPage from './pages/CartPage';
import ChatsPage from './pages/ChatsPage';
import ChatDetailPage from './pages/ChatDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import PaymentPage from './pages/PaymentPage';
import NotificationsPage from './pages/NotificationsPage';
import WishlistPage from './pages/WishlistPage';
import TransactionsPage from './pages/TransactionsPage';
import HelpPage from './pages/HelpPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Routes>
              <Route element={<Layout />}>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/clothes" element={<ClothesPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route
                  path="/clothes/new"
                  element={<ProtectedRoute><ClothesFormPage /></ProtectedRoute>}
                />
                <Route
                  path="/clothes/:id/edit"
                  element={<ProtectedRoute><ClothesFormPage /></ProtectedRoute>}
                />
                <Route path="/clothes/:id" element={<ClothesDetailPage />} />
                <Route path="/posts" element={<PostsPage />} />
                <Route
                  path="/swaps"
                  element={<ProtectedRoute><SwapsPage /></ProtectedRoute>}
                />
                <Route
                  path="/donations"
                  element={<ProtectedRoute><DonationsPage /></ProtectedRoute>}
                />
                <Route
                  path="/cart"
                  element={<ProtectedRoute><CartPage /></ProtectedRoute>}
                />
                <Route
                  path="/chats"
                  element={<ProtectedRoute><ChatsPage /></ProtectedRoute>}
                />
                <Route
                  path="/chats/:id"
                  element={<ProtectedRoute><ChatDetailPage /></ProtectedRoute>}
                />
                <Route
                  path="/profile"
                  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
                />
                <Route
                  path="/notifications"
                  element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
                />
                <Route
                  path="/wishlist"
                  element={<ProtectedRoute><WishlistPage /></ProtectedRoute>}
                />
                <Route
                  path="/transactions"
                  element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>}
                />
                <Route
                  path="/payment"
                  element={<ProtectedRoute><PaymentPage /></ProtectedRoute>}
                />

                {/* Admin */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
