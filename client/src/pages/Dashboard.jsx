import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../services/api';
import TripCard from '../components/TripCard';
import CityCard from '../components/CityCard';
import ShareModal from '../components/ShareModal';
import {
  Compass,
  PlusCircle,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plane,
  Luggage,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareTrip, setShareTrip] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [tripsRes, citiesRes] = await Promise.all([
          api.getTrips(),
          api.getPopularCities(4)
        ]);
        setTrips(tripsRes.trips || []);
        setPopularCities(citiesRes.cities || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDeleteTrip = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;
    try {
      await api.deleteTrip(id);
      setTrips(trips.filter(t => t.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete trip');
    }
  };

  const handleDuplicateTrip = async (id) => {
    try {
      const res = await api.duplicateTrip(id);
      setTrips([res.trip, ...trips]);
      alert('Trip copied successfully!');
    } catch (err) {
      alert(err.message || 'Failed to duplicate trip');
    }
  };

  // Metrics computation
  const totalTripsCount = trips.length;
  const totalStopsCount = trips.reduce((sum, t) => sum + (t.stop_count || 0), 0);
  const totalBudgetManaged = trips.reduce((sum, t) => sum + (t.total_budget || 0), 0);
  const upcomingTrips = trips.filter(t => t.status === 'Upcoming' || t.status === 'Ongoing');

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-8 sm:p-10 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Travel Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {getTimeGreeting()}, {user?.name?.split(' ')[0] || 'Traveler'}! ✈️
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Where would you like to wander next? Create multi-city routes, explore curated activities, and track trip expenses seamlessly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/trips/new"
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 flex items-center space-x-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Plan New Trip</span>
            </Link>
            <Link
              to="/cities"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm transition-all flex items-center space-x-1.5"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Cities</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-emerald-200 uppercase font-semibold flex items-center">
              <Luggage className="w-3.5 h-3.5 mr-1" /> Total Trips
            </span>
            <p className="text-2xl font-black mt-1">{totalTripsCount}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-emerald-200 uppercase font-semibold flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1" /> Cities Planned
            </span>
            <p className="text-2xl font-black mt-1">{totalStopsCount}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-emerald-200 uppercase font-semibold flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1" /> Total Budget
            </span>
            <p className="text-2xl font-black mt-1">{formatPrice(totalBudgetManaged)}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-emerald-200 uppercase font-semibold flex items-center">
              <Award className="w-3.5 h-3.5 mr-1" /> Style
            </span>
            <p className="text-base font-bold mt-1.5 truncate">{user?.travel_style || 'Balanced'}</p>
          </div>
        </div>
      </div>

      {/* Upcoming / Active Trips Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Upcoming & Active Trips</h2>
            <p className="text-xs text-slate-500">Pick up right where you left off</p>
          </div>
          <Link
            to="/trips"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View All ({trips.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
            ))}
          </div>
        ) : upcomingTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTrips.slice(0, 3).map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={handleDeleteTrip}
                onDuplicate={handleDuplicateTrip}
                onShare={(t) => setShareTrip(t)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Plane className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No active trips yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Start your travel story by creating your first personalized multi-city itinerary.
              </p>
            </div>
            <Link
              to="/trips/new"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Trip</span>
            </Link>
          </div>
        )}
      </section>

      {/* Recommended Global Destinations Section */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Trending Destinations to Explore</h2>
            <p className="text-xs text-slate-500">Curated top world cities for your next getaway</p>
          </div>
          <Link
            to="/cities"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Explore All Cities</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularCities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              onSelect={(c) => navigate(`/cities?id=${c.id}`)}
              onAddToTrip={(c) => navigate(`/trips/new?city_id=${c.id}`)}
            />
          ))}
        </div>
      </section>

      {/* Share Modal Popup */}
      <ShareModal
        isOpen={!!shareTrip}
        trip={shareTrip}
        onClose={() => setShareTrip(null)}
      />
    </div>
  );
}
