import { useState, useEffect } from 'react';
import { Edit2, Trash2, ExternalLink, Plus, Loader2, Heart, MessageCircle } from 'lucide-react';
import { postAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';

export default function MyPosts() {
  const { user } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPosts = async () => {
    try {
      const res = await postAPI.getAll({ author: user._id });
      setPosts(res.data.data);
    } catch {
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchMyPosts();
  }, [user?._id]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await postAPI.remove(id);
      toast.success('Post deleted');
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-500 mb-4">You haven't shared any posts yet.</p>
        <Button size="sm" onClick={() => (window.location.href = '/posts')}>
          <Plus className="h-4 w-4" /> Go to Community
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">My Posts ({posts.length})</h3>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-3 rounded-xl border border-gray-200 flex gap-4 items-center hover:shadow-sm transition-shadow">
            <img 
              src={post.images?.[0] || 'https://via.placeholder.com/100'} 
              alt="Post" 
              className="w-16 h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 font-medium truncate">
                {post.caption || 'No caption'}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes?.length || 0}</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comments?.length || 0}</span>
                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => (window.location.href = '/posts')}
                className="p-2 text-gray-400 hover:text-primary-600 bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                title="View in Community"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDelete(post._id)}
                className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
