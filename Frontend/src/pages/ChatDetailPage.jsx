import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User } from 'lucide-react';
import { io } from 'socket.io-client';
import { chatAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingScreen from '../components/ui/LoadingScreen';

// Socket connection (outside component to avoid re-creation or use a ref)
const socket = io('http://localhost:5000');

export default function ChatDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [chat, setChat] = useState(null);

  // Initial fetch and Socket setup
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chatsRes, msgsRes] = await Promise.all([
          chatAPI.getAll(),
          chatAPI.getMessages(id, { limit: 100 }),
        ]);
        const thisChat = chatsRes.data.data.find((c) => c._id === id);
        setChat(thisChat);
        setMessages(msgsRes.data.data.reverse()); // oldest first
      } catch {
        toast.error('Chat not found');
        navigate('/chats');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Socket: Join room
    socket.emit('join_chat', id);

    // Socket: Listen for messages
    const messageListener = (message) => {
      // Only add if not own message (already added on handleSend) or if it's from recipient
      setMessages((prev) => {
        if (prev.find(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    socket.on('new_message', messageListener);

    return () => {
      socket.emit('leave_chat', id);
      socket.off('new_message', messageListener);
    };
  }, [id, navigate, toast]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const otherUser = chat?.participants?.find((p) => p._id !== user?._id) || {};

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await chatAPI.sendMessage(id, { text: text.trim() });
      const newMessage = res.data.data;
      setMessages((prev) => [...prev, newMessage]);
      setText('');
      // Note: emit is handled by backend controller
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading chat..." />;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/chats')}
          className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
          <User className="h-4 w-4 text-primary-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{otherUser.name || 'User'}</p>
          <p className="text-xs text-gray-400">{otherUser.email || ''}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === user?._id || msg.sender_id?._id === user?._id;
          return (
            <div
              key={msg._id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isOwn
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                }`}
              >
                <p>{msg.message}</p>
                <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-200' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3"
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-2.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
