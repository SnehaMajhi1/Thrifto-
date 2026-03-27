import { useState } from 'react';
import { User, Mail, Phone, MapPin, Award, Lock, Save, MessageSquare, Heart, Camera, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { userAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ChatsPage from './ChatsPage';
import ProgressDashboard from '../components/profile/ProgressDashboard';
import MyListings from '../components/profile/MyListings';
import MyPosts from '../components/profile/MyPosts';
import WishlistPage from './WishlistPage';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState('dashboard'); // profile | password | dashboard | chats | listings | posts | wishlist
  const [profileFile, setProfileFile] = useState(null);

  // Profile form
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      if (profile.phone) formData.append('phone', profile.phone);
      
      if (profile.street) formData.append('address.street', profile.street);
      if (profile.city) formData.append('address.city', profile.city);
      if (profile.state) formData.append('address.state', profile.state);
      if (profile.zipCode) formData.append('address.zipCode', profile.zipCode);

      if (profileFile) {
        formData.append('profilePicture', profileFile);
      }

      await userAPI.updateProfile(user._id, formData);
      await refreshUser();
      toast.success('Profile updated!');
      setProfileFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await userAPI.updatePassword({
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-700 rounded-2xl p-6 mb-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Leaf className="h-32 w-32 rotate-12" />
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-sm">
              {profileFile ? (
                <img src={URL.createObjectURL(profileFile)} className="w-full h-full object-cover" />
              ) : user?.profilePicture ? (
                <img src={user.profilePicture} className="w-full h-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-white/70" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-emerald-600 rounded-full border-2 border-white cursor-pointer shadow-lg hover:bg-emerald-500 transition-all hover:scale-110">
              <Camera className="h-4 w-4 text-white" />
              <input type="file" accept="image/*" onChange={(e) => setProfileFile(e.target.files[0])} className="hidden" />
            </label>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{user?.name}</h1>
            <p className="text-emerald-50/80 text-sm font-medium flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{user?.email}</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold bg-yellow-400 text-emerald-900 px-3 py-1.5 rounded-full w-fit shadow-sm">
              <Award className="h-4 w-4" />
              <span>{user?.ecoPoints || 0} EcoPoints Earned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8 bg-gray-100 rounded-xl p-1.5 shadow-inner">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'profile', label: 'Profile' },
          { id: 'password', label: 'Security' },
          { id: 'chats', label: 'Messages' },
          { id: 'listings', label: 'Listings' },
          { id: 'wishlist', label: 'Wishlist' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-2 py-2.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all uppercase tracking-wider ${
              tab === t.id ? 'bg-white text-emerald-700 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-emerald-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' ? <ProgressDashboard /> : 
       tab === 'profile' ? (
        <form onSubmit={handleProfileUpdate} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 animate-fade-in">
          <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Mailing Address</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Street" value={profile.street} onChange={(e) => setProfile({ ...profile, street: e.target.value })} />
              <Input label="City" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
              <Input label="State" value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
              <Input label="Zip Code" value={profile.zipCode} onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })} />
            </div>
          </div>
          <Button type="submit" loading={profileLoading} className="w-full mt-4">Save Changes</Button>
        </form>
      ) : tab === 'password' ? (
        <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 animate-fade-in">
          <Input label="Current Password" type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          <Input label="New Password" type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          <Input label="Confirm New Password" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          <Button type="submit" loading={pwLoading} className="w-full mt-4">Update Password</Button>
        </form>
      ) : tab === 'chats' ? <ChatsPage /> :
       tab === 'listings' ? <MyListings /> :
       <WishlistPage />
      }
    </div>
  );
}
