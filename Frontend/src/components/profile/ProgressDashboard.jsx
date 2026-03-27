import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ShoppingBag, ArrowLeftRight, Heart, MessageSquare, Loader2 } from 'lucide-react';
import { userAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ProgressDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await userAPI.getDashboard();
        setStats(res.data.data);
      } catch (err) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  const chartData = {
    labels: stats.trend.map(t => t.label),
    datasets: [
      {
        fill: true,
        label: 'Items Listed',
        data: stats.trend.map(t => t.count),
        borderColor: 'rgb(16, 185, 129)', // Emerald 500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  };

  const cards = [
    {
      title: 'Items & Orders',
      icon: ShoppingBag,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      stats: [
        { label: 'Active Listings', value: stats.listings.active },
        { label: 'Items Sold', value: stats.listings.sold }
      ]
    },
    {
      title: 'Swaps',
      icon: ArrowLeftRight,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      stats: [
        { label: 'Pending Requests', value: stats.swaps.pending },
        { label: 'Completed', value: stats.swaps.completed }
      ]
    },
    {
      title: 'Donations',
      icon: Heart,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
      stats: [
        { label: 'Pending', value: stats.donations.pending },
        { label: 'Approved', value: stats.donations.completed }
      ]
    },
    {
      title: 'Chats',
      icon: MessageSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      stats: [
        { label: 'Active Chats', value: stats.chats.active },
        { label: 'Unread Messages', value: stats.chats.unread }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-800">{card.title}</h3>
              </div>
              <div className="space-y-2">
                {card.stats.map((stat, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{stat.label}</span>
                    <span className="font-bold text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-6">Activity Trends (Last 6 Months)</h3>
        <div className="h-[300px] w-full">
          <Line options={chartOptions} data={chartData} />
        </div>
      </div>
    </div>
  );
}
