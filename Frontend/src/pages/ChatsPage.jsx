import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, User, Search } from 'lucide-react';
import { chatAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';
import EmptyState from '../components/ui/EmptyState';

export default function ChatsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await chatAPI.getAll();
        setChats(res.data.data);
      } catch {
        setChats([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getOtherParticipant = (chat) => {
    return chat.participants?.find((p) => p._id !== user?._id) || {};
  };

  const filteredChats = chats.filter((chat) => {
    if (!search.trim()) return true;
    const other = getOtherParticipant(chat);
    return other.name?.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <LoadingScreen message="Loading chats..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

      {chats.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Start a chat by contacting a seller from any clothing listing."
        />
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {filteredChats.map((chat) => {
              const other = getOtherParticipant(chat);
              return (
                <button
                  key={chat._id}
                  onClick={() => navigate(`/chats/${chat._id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {other.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {chat.lastMessage?.message || 'No messages yet'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </p>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
