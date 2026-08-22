import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import CityCard from '../components/CityCard';
import {
  User,
  Mail,
  Lock,
  Globe,
  DollarSign,
  Heart,
  Save,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Shield,
  Layers
} from 'lucide-react';

export default function ProfileSettings() {
  const { user, updateUserData, logout } = useAuth();
  const { currency, setCurrency, rates } = useCurrency();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'security', 'saved'
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [travelStyle, setTravelStyle] = useState(user?.travel_style || 'Balanced');

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Wishlist
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getProfile();
      setName(res.user.name);
      setAvatarUrl(res.user.avatar_url || '');
      setBio(res.user.bio || '');
      setLanguage(res.user.language || 'en');
      setTravelStyle(res.user.travel_style || 'Balanced');
      setSavedDestinations(res.savedDestinations || []);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setFeedbackMsg('');
    setErrorMsg('');
    try {
      const res = await api.updateProfile({
        name,
        avatar_url: avatarUrl,
        bio,
        language,
        travel_style: travelStyle,
        currency
      });
      updateUserData(res.user);
      setFeedbackMsg('Profile preferences updated successfully!');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFeedbackMsg('');
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }

    try {
      await api.changePassword({ currentPassword, newPassword });
      setFeedbackMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password');
    }
  };

  const handleRemoveSaved = async (cityId) => {
    try {
      await api.toggleSavedDestination(cityId);
      setSavedDestinations(prev => prev.filter(c => c.id !== cityId));
    } catch (err) {
      console.error('Failed to remove saved destination:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete your account and all itineraries? This action cannot be reversed.')) return;
    try {
      await api.deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      alert(err.message || 'Failed to delete account');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account & Preferences</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your traveler profile, currencies, wishlist, and credentials</p>
      </div>

      {/* Status Feedback */}
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="space-y-2 md:col-span-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-2.5 transition-all ${
              activeTab === 'general'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-2.5 transition-all ${
              activeTab === 'saved'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Destinations ({savedDestinations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-2.5 transition-all ${
              activeTab === 'security'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Password & Security</span>
          </button>
        </div>

        {/* Content Pane */}
        <div className="md:col-span-3">
          
          {/* General Profile Settings */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                Personal Information & Travel Preferences
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="flex items-center space-x-4">
                  <img
                    src={avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${name || 'User'}`}
                    alt={name}
                    className="w-16 h-16 rounded-full border-2 border-emerald-500 object-cover"
                  />
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Image URL</label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Travel Motto</label>
                  <textarea
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other travelers about your favorite destinations, style, and travel dreams..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      {Object.keys(rates).map((c) => (
                        <option key={c} value={c}>
                          {rates[c].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="en">English (US/UK)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ja">日本語 (Japanese)</option>
                      <option value="hi">हिंदी (Hindi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Travel Style</label>
                    <select
                      value={travelStyle}
                      onChange={(e) => setTravelStyle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="Balanced">Balanced</option>
                      <option value="Adventure & Culture">Adventure & Culture</option>
                      <option value="Luxury & Wellness">Luxury & Wellness</option>
                      <option value="Food & Dining">Foodie</option>
                      <option value="Budget Backpacker">Backpacker</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Saved Destinations Wishlist */}
          {activeTab === 'saved' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Saved Destinations Wishlist</h3>
                  <p className="text-xs text-slate-500">World cities you've bookmarked for upcoming journeys</p>
                </div>
                <button
                  onClick={() => navigate('/cities')}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  + Explore More Cities
                </button>
              </div>

              {savedDestinations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedDestinations.map((city) => (
                    <CityCard
                      key={city.id}
                      city={city}
                      isSaved={true}
                      onToggleSave={handleRemoveSaved}
                      onSelect={(c) => navigate(`/cities?id=${c.id}`)}
                      onAddToTrip={(c) => navigate(`/trips/new?city_id=${c.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs">
                  You haven't saved any destinations yet. Explore the city catalog to bookmark your dream places!
                </div>
              )}
            </div>
          )}

          {/* Password & Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                  Change Password
                </h3>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="bg-rose-50/50 rounded-3xl border border-rose-200 p-6 sm:p-8 space-y-4">
                <h4 className="text-sm font-bold text-rose-900">Danger Zone</h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Permanently delete your user account, stored itineraries, and customized travel stops. This action cannot be recovered.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
