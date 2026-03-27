import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingScreen from '../components/ui/LoadingScreen';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to update notifications');
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary-500" />
          Notifications
        </h1>
        {notifications.some(n => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState 
          icon={Bell} 
          title="No notifications yet" 
          description="We'll notify you when something important happens." 
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div 
              key={n._id} 
              className={`p-4 rounded-2xl border transition-all ${
                n.isRead ? 'bg-white border-gray-100 opacity-75' : 'bg-primary-50 border-primary-100 shadow-sm'
              }`}
            >
              <div className="flex gap-4 items-start">
                <div className={`p-2 rounded-full ${n.isRead ? 'bg-gray-100 text-gray-400' : 'bg-white text-primary-600 shadow-sm'}`}>
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                    {n.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(n._id)}
                    className="p-1 text-primary-400 hover:text-primary-600 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
