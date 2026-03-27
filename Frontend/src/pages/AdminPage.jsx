import { useState, useEffect } from 'react';
import {
  Users,
  ShoppingBag,
  FileText,
  Heart,
  ArrowLeftRight,
  Award,
  TrendingUp,
  Trash2,
  MessageSquare,
  Activity as ActivityIcon,
  Search,
  Flag
} from 'lucide-react';

import { adminAPI, clothesAPI, postAPI, orderAPI, reportAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingScreen from '../components/ui/LoadingScreen';
import Pagination from '../components/ui/Pagination';

export default function AdminPage() {
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, pages: 1 });
  const [tab, setTab] = useState('overview'); // overview | users | clothes | posts | messages | activities | orders | analytics | reports
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);

  const [clothes, setClothes] = useState([]);
  const [posts, setPosts] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activityPagination, setActivityPagination] = useState({ page: 1, pages: 1 });
  const [messagePagination, setMessagePagination] = useState({ page: 1, pages: 1 });


  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminAPI.getStats();
        setStats(res.data.data);
      } catch (err) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [toast]);

  const fetchUsers = async (page = 1) => {
    try {
      const res = await adminAPI.getUsers({ page, limit: 20 });
      setUsers(res.data.data);
      setUserPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  const fetchClothes = async (page = 1) => {
    try {
      const res = await clothesAPI.getAll({ page, limit: 20 });
      setClothes(res.data.data);
    } catch (err) {
      toast.error('Failed to load clothes');
    }
  };

  const fetchPosts = async (page = 1) => {
    try {
      const res = await postAPI.getAll({ page, limit: 20 });
      setPosts(res.data.data);
    } catch (err) {
      toast.error('Failed to load posts');
    }
  };

  const fetchMessages = async (page = 1) => {
    try {
      const res = await adminAPI.getMessages({ page, limit: 50 });
      setAllMessages(res.data.data);
      setMessagePagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const fetchActivities = async (page = 1) => {
    try {
      const res = await adminAPI.getActivities({ page, limit: 50 });
      setActivities(res.data.data);
      setActivityPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load activities');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getAll();
      setOrders(res.data.data);
    } catch (err) {
      toast.error('Failed to load orders');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await adminAPI.getAnalytics();
      setAnalytics(res.data.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    }
  };

  const fetchReports = async () => {
    try {
      const res = await reportAPI.getAll();
      setReports(res.data.data);
    } catch (err) {
      toast.error('Failed to load reports');
    }
  };

  useEffect(() => {
    if (tab === 'users') fetchUsers();
    if (tab === 'clothes') fetchClothes();
    if (tab === 'posts') fetchPosts();
    if (tab === 'messages') fetchMessages();
    if (tab === 'activities') fetchActivities();
    if (tab === 'orders') fetchOrders();
    if (tab === 'analytics') fetchAnalytics();
    if (tab === 'reports') fetchReports();
  }, [tab]);

  const handleDeleteUser = async (userId) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deactivated');
      fetchUsers(userPagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleBanUser = async (userId, isBanned) => {
    try {
      await adminAPI.banUser(userId, { isBanned });
      toast.success(isBanned ? 'User banned' : 'User unbanned');
      fetchUsers(userPagination.page);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteItem = async (id, type) => {
    if (!confirm(`Permanently delete this ${type}?`)) return;
    try {
      if (type === 'clothes') await clothesAPI.remove(id);
      if (type === 'post') await postAPI.remove(id);
      toast.success(`${type === 'clothes' ? 'Listing' : 'Post'} deleted`);
      if (type === 'clothes') fetchClothes();
      if (type === 'post') fetchPosts();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleResolveReport = async (id) => {
    try {
      await reportAPI.resolve(id);
      toast.success('Report resolved');
      fetchReports();
    } catch (err) {
      toast.error('Resolution failed');
    }
  };

  if (loading) return <LoadingScreen message="Loading admin panel..." />;

  const statCards = stats
    ? [
        { label: 'Users', value: stats.counts.users, icon: Users, color: 'text-blue-600 bg-blue-100' },
        { label: 'Clothes', value: stats.counts.clothes, icon: ShoppingBag, color: 'text-primary-600 bg-primary-100' },
        { label: 'Posts', value: stats.counts.posts, icon: FileText, color: 'text-purple-600 bg-purple-100' },
        { label: 'Donations', value: stats.counts.donations, icon: Heart, color: 'text-pink-600 bg-pink-100' },
        { label: 'Swaps', value: stats.counts.swaps, icon: ArrowLeftRight, color: 'text-amber-600 bg-amber-100' },
        { label: 'EcoPoints Total', value: stats.ecoPoints?.total || 0, icon: Award, color: 'text-green-600 bg-green-100' },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage your platform</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 rounded-lg p-1 overflow-x-auto whitespace-nowrap">
        {['overview', 'users', 'clothes', 'posts', 'messages', 'activities', 'orders', 'analytics', 'reports'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer capitalize ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
              >
                <div className={`inline-flex p-2 rounded-lg ${color} mb-2`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Breakdowns */}
          {stats?.breakdown && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 font-[var(--font-body)]">Clothes Status</h3>
                {stats.breakdown.clothesStatus?.map((s) => (
                  <div key={s._id} className="flex justify-between py-1.5 text-sm">
                    <span className="text-gray-600 capitalize">{s._id}</span>
                    <span className="font-medium text-gray-900">{s.count}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 font-[var(--font-body)]">Donation Status</h3>
                {stats.breakdown.donationStatus?.map((s) => (
                  <div key={s._id} className="flex justify-between py-1.5 text-sm">
                    <span className="text-gray-600 capitalize">{s._id}</span>
                    <span className="font-medium text-gray-900">{s.count}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 font-[var(--font-body)]">Swap Status</h3>
                {stats.breakdown.swapStatus?.map((s) => (
                  <div key={s._id} className="flex justify-between py-1.5 text-sm">
                    <span className="text-gray-600 capitalize">{s._id}</span>
                    <span className="font-medium text-gray-900">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : tab === 'users' ? (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3"><Badge variant={u.role === 'admin' ? 'accent' : 'default'}>{u.role}</Badge></td>
                      <td className="px-4 py-3">
                        <Badge variant={u.isActive ? (u.isBanned ? 'danger' : 'success') : 'default'}>
                          {u.isBanned ? 'Banned' : (u.isActive ? 'Active' : 'Inactive')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== 'admin' && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleBanUser(u._id, !u.isBanned)}
                              className={`px-2 py-1 rounded text-xs font-semibold ${u.isBanned ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                            >
                              {u.isBanned ? 'Unban' : 'Ban'}
                            </button>
                            <button onClick={() => handleDeleteUser(u._id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={userPagination.page} pages={userPagination.pages} onPageChange={(p) => fetchUsers(p)} />
        </>
      ) : tab === 'clothes' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr><th className="px-6 py-4 text-left">Listing</th><th className="px-6 py-4 text-left">Seller</th><th className="px-6 py-4 text-left">Status</th><th className="px-6 py-4 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clothes.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3"><img src={item.images?.[0]} className="w-10 h-10 rounded-md object-cover" /><span>{item.title}</span></td>
                    <td className="px-6 py-4">{item.seller?.name}</td>
                    <td className="px-6 py-4"><Badge variant={item.status === 'available' ? 'success' : 'default'}>{item.status}</Badge></td>
                    <td className="px-6 py-4 text-right"><button onClick={() => handleDeleteItem(item._id, 'clothes')} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === 'posts' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr><th className="px-6 py-4 text-left">Post</th><th className="px-6 py-4 text-left">Author</th><th className="px-6 py-4 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 line-clamp-1">{post.content}</td>
                    <td className="px-6 py-4">{post.author?.name}</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => handleDeleteItem(post._id, 'post')} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === 'messages' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr><th className="px-6 py-4 text-left">Sender</th><th className="px-6 py-4 text-left">Text</th><th className="px-6 py-4 text-left">Time</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allMessages.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50 overflow-hidden text-ellipsis">
                    <td className="px-6 py-4 font-medium">{m.sender_id?.name}</td>
                    <td className="px-6 py-4">{m.message}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(m.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={messagePagination.page} pages={messagePagination.pages} onPageChange={(p) => fetchMessages(p)} />
        </div>
      ) : tab === 'activities' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr><th className="px-6 py-4 text-left">User</th><th className="px-6 py-4 text-left">Action</th><th className="px-6 py-4 text-left">Time</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{a.user?.name}</td>
                    <td className="px-6 py-4">{a.action}</td>
                    <td className="px-6 py-4">{new Date(a.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={activityPagination.page} pages={activityPagination.pages} onPageChange={(p) => fetchActivities(p)} />
        </div>
      ) : tab === 'orders' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr><th className="px-6 py-4 text-left">Buyer</th><th className="px-6 py-4 text-left">Seller</th><th className="px-6 py-4 text-left">Item</th><th className="px-6 py-4 text-left">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{o.buyer?.name}</td>
                    <td className="px-6 py-4">{o.seller?.name}</td>
                    <td className="px-6 py-4">{o.item?.title}</td>
                    <td className="px-6 py-4"><Badge variant="success">{o.orderStatus}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === 'analytics' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4">User Growth</h3>
            {analytics && <div className="h-64"><Bar data={{ labels: analytics.userGrowth.map(d => `${d._id.month}/${d._id.year}`), datasets: [{ label: 'Users', data: analytics.userGrowth.map(d => d.count), backgroundColor: 'rgba(16, 185, 129, 0.6)' }] }} options={{ maintainAspectRatio: false }} /></div>}
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Activity Trend</h3>
            {analytics && <div className="h-64"><Line data={{ labels: analytics.activityTrend.map(d => `${d._id.month}/${d._id.year}`), datasets: [{ label: 'Actions', data: analytics.activityTrend.map(d => d.count), borderColor: 'rgb(59, 130, 246)', fill: true, backgroundColor: 'rgba(59, 130, 246, 0.1)' }] }} options={{ maintainAspectRatio: false }} /></div>}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr><th className="px-6 py-4 text-left">Reporter</th><th className="px-6 py-4 text-left">Target</th><th className="px-6 py-4 text-left">Reason</th><th className="px-6 py-4 text-left">Status</th><th className="px-6 py-4 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{r.reporter?.name}</td>
                    <td className="px-6 py-4 capitalize">{r.targetType}: {r.targetId}</td>
                    <td className="px-6 py-4">{r.reason}</td>
                    <td className="px-6 py-4"><Badge variant={r.status === 'pending' ? 'danger' : 'success'}>{r.status}</Badge></td>
                    <td className="px-6 py-4 text-right">
                      {r.status === 'pending' && <button onClick={() => handleResolveReport(r._id)} className="text-primary-600 hover:text-primary-800 text-xs font-bold">Resolve</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
