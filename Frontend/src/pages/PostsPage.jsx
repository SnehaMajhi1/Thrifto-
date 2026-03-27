import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Plus, User, Trash2, Edit2, MoreVertical } from 'lucide-react';
import { postAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import LoadingScreen from '../components/ui/LoadingScreen';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Textarea from '../components/ui/Textarea';
import Input from '../components/ui/Input';

export default function PostsPage() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newPost, setNewPost] = useState({ caption: '', tags: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [commentText, setCommentText] = useState({});

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await postAPI.getAll({ page, limit: 10 });
      setPosts(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenCreate = () => {
    setEditingPostId(null);
    setNewPost({ images: '', caption: '', tags: '' });
    setShowCreate(true);
  };

  const handleOpenEdit = (post) => {
    setEditingPostId(post._id);
    setNewPost({
      images: post.images?.join(', ') || '',
      caption: post.caption || '',
      tags: post.tags?.join(', ') || '',
    });
    setShowCreate(true);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0 && !editingPostId) {
      toast.error('Choose at least one image');
      return;
    }
    setCreateLoading(true);
    try {
      const formData = new FormData();
      if (newPost.caption.trim()) formData.append('caption', newPost.caption.trim());
      if (newPost.tags.trim()) {
        newPost.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => formData.append('tags', t));
      }
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      if (editingPostId) {
        await postAPI.update(editingPostId, formData);
        toast.success('Post updated!');
      } else {
        await postAPI.create(formData);
        toast.success('Post created!');
      }
      
      setShowCreate(false);
      setNewPost({ caption: '', tags: '' });
      setImageFiles([]);
      setEditingPostId(null);
      fetchPosts(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${editingPostId ? 'update' : 'create'} post`);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await postAPI.remove(postId);
      toast.success('Post deleted');
      fetchPosts(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) return toast.error('Log in to like posts');
    try {
      const res = await postAPI.like(postId);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? res.data.data : p))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    if (!isAuthenticated) return toast.error('Log in to comment');
    try {
      const res = await postAPI.comment(postId, { text });
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? res.data.data : p))
      );
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-500 mt-1">Share your sustainable style</p>
        </div>
        {isAuthenticated && (
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" /> New Post
          </Button>
        )}
      </div>

      {/* Post Feed */}
      {loading ? (
        <LoadingScreen message="Loading feed..." />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Be the first to share your sustainable style!"
        >
          {isAuthenticated && (
            <Button onClick={handleOpenCreate} size="sm">
              <Plus className="h-4 w-4" /> Create Post
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Author */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {post.author?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {user && (post.author?._id === user._id || user.role === 'admin') && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(post)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Post"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Images */}
              {post.images?.length > 0 && (
                <div className="aspect-square bg-gray-100">
                  <img
                    src={post.images[0]}
                    alt="Post"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=Post&background=d1fae5&color=065f46&size=400`;
                    }}
                  />
                </div>
              )}

              {/* Actions + Caption */}
              <div className="px-5 py-3">
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-1 text-sm cursor-pointer transition-colors ${
                      post.likes?.includes(user?._id)
                        ? 'text-red-500'
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Heart
                      className="h-5 w-5"
                      fill={post.likes?.includes(user?._id) ? 'currentColor' : 'none'}
                    />
                    {post.likes?.length || 0}
                  </button>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MessageCircle className="h-5 w-5" />
                    {post.comments?.length || 0}
                  </span>
                </div>

                {post.caption && (
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">{post.author?.name}</span>{' '}
                    {post.caption}
                  </p>
                )}

                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="primary">#{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Comments preview */}
                {post.comments?.length > 0 && (
                  <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                    {post.comments.slice(-3).map((c, i) => (
                      <p key={i} className="text-xs text-gray-600">
                        <span className="font-medium">{c.user?.name || 'User'}</span>{' '}
                        {c.text}
                      </p>
                    ))}
                  </div>
                )}

                {/* Add comment */}
                {isAuthenticated && (
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText[post._id] || ''}
                      onChange={(e) =>
                        setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 cursor-pointer"
                    >
                      Post
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(p) => fetchPosts(p)}
          />
        </div>
      )}

      {/* Create/Edit Post Modal */}
      <Modal 
        isOpen={showCreate} 
        onClose={() => setShowCreate(false)} 
        title={editingPostId ? 'Edit Post' : 'New Post'}
      >
        <form onSubmit={handleSubmitPost} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Photos *</label>
            <div className="group relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImageFiles(Array.from(e.target.files))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full px-4 py-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl group-hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-1">
                <Plus className="h-5 w-5 text-gray-400" />
                <p className="text-xs text-gray-500">Add Photos</p>
              </div>
            </div>

            {imageFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {imageFiles.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 p-1 bg-white/80 rounded-full text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Textarea
            label="Caption"
            placeholder="Share your sustainable fashion story..."
            value={newPost.caption}
            onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
          />
          <Input
            label="Tags (comma-separated)"
            placeholder="thrifted, vintage, upcycled"
            value={newPost.tags}
            onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={createLoading} className="flex-1">
              {editingPostId ? 'Update' : 'Publish'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
