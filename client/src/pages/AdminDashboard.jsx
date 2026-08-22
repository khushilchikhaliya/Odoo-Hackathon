import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  ShieldAlert,
  Users,
  Luggage,
  MapPin,
  DollarSign,
  Activity,
  Trash2,
  Shield,
  UserCheck,
  CheckCircle,
  Clock,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers()
      ]);
      setStats(statsRes.stats);
      setUsersList(usersRes.users || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadAdminData();
  }, [user]);

  const handleToggleUserRole = async (userId) => {
    try {
      const res = await api.toggleUserRole(userId);
      setActionMsg(res.message);
      loadAdminData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to toggle user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      await api.deleteAdminUser(userId);
      setActionMsg('User removed successfully');
      loadAdminData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading platform admin analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-slate-500">
        Admin data unavailable or unauthorized
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Platform Administration & Analytics</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Control Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor platform adoption, user engagement, travel trends, and account management
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Registered Travelers</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.totalUsers}</p>
          <span className="text-xs font-semibold text-emerald-600 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> Active platform community
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Trips Created</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Luggage className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.totalTrips}</p>
          <span className="text-xs text-slate-400">{stats.totalStops} multi-city stops planned</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Activities Scheduled</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.totalActivitiesPlanned}</p>
          <span className="text-xs text-slate-400">Experiences & sights assigned</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Planned Budget Volume</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{formatPrice(stats.totalBudgetVol)}</p>
          <span className="text-xs text-slate-400">Total cumulative traveler budgets</span>
        </div>

      </div>

      {/* Top Destinations & Activity Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Planned Destinations */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
              Most Popular Itinerary Cities
            </h3>
            <span className="text-xs text-slate-400">By stops added</span>
          </div>

          <div className="space-y-3">
            {stats.topCities && stats.topCities.map((city, idx) => (
              <div
                key={city.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <img
                    src={city.image_url}
                    alt={city.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{city.name}, {city.country}</h5>
                    <span className="text-[11px] text-slate-400">Added to {city.trip_count} itineraries</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {city.trip_count} Stops
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Categories Distribution */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-600" />
              Popular Activity Categories
            </h3>
            <span className="text-xs text-slate-400">Platform distribution</span>
          </div>

          <div className="space-y-3">
            {stats.categoryStats && stats.categoryStats.map((cat, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{cat.category}</span>
                  <span className="text-purple-700">{cat.count} planned</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((cat.count / (stats.totalActivitiesPlanned || 1)) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">User Management Directory</h3>
            <p className="text-xs text-slate-500">Manage registered travelers and administrator privileges</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
            {usersList.length} Total Users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">User</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Trips Created</th>
                <th className="py-3 px-6">Travel Style</th>
                <th className="py-3 px-6">Joined Date</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.name}`}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                        <span className="text-[11px] text-slate-400">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-bold text-slate-800">
                    {u.trip_count || 0}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600 font-medium">
                    {u.travel_style || 'Balanced'}
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">
                    {u.created_at ? u.created_at.slice(0, 10) : 'Recent'}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleToggleUserRole(u.id)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors"
                      >
                        {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-20 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Activity Stream */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-slate-500" />
            Live Platform Audit Stream
          </h3>
          <span className="text-xs text-slate-400">Recent system actions</span>
        </div>

        <div className="space-y-2.5">
          {stats.recentLogs && stats.recentLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-bold text-[10px] uppercase">
                  {log.action_type}
                </span>
                <span className="text-slate-700 font-medium">{log.description}</span>
              </div>
              <span className="text-slate-400 text-[11px]">{log.created_at || 'Just now'}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
