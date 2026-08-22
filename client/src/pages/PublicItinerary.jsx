import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import TimelineView from '../components/TimelineView';
import {
  Compass,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Copy,
  Check,
  Share2,
  Twitter,
  MessageCircle,
  Sparkles,
  Hotel,
  Plane,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function PublicItinerary() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPublicTrip() {
      try {
        setLoading(true);
        const res = await api.getPublicTrip(token);
        setTrip(res.trip);
      } catch (err) {
        console.error('Failed to load shared itinerary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicTrip();
  }, [token]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCloneTrip = async () => {
    if (!user) {
      alert('Please log in or create an account to copy this trip to your personal itineraries!');
      navigate('/login');
      return;
    }

    setCloning(true);
    try {
      const res = await api.clonePublicTrip(token);
      alert('Trip copied to your account successfully!');
      navigate(`/trips/${res.trip.id}/builder`);
    } catch (err) {
      alert(err.message || 'Failed to clone trip');
    } finally {
      setCloning(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading shared community itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full mx-auto flex items-center justify-center">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Itinerary Not Found</h2>
        <p className="text-xs text-slate-500">This travel itinerary link may have been made private or expired.</p>
        <Link to="/" className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md">
          Explore GlobeTrotter Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Showcase Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl min-h-[340px] flex flex-col justify-between p-6 sm:p-10 text-white">
        <img
          src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

        {/* Top Badges & Author */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-sm">
              Public Itinerary
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-emerald-300">
              {trip.travel_style || 'Balanced'}
            </span>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors backdrop-blur-md ${
                copied ? 'bg-emerald-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
            </button>

            <button
              onClick={() => {
                const text = encodeURIComponent(`Check out this travel itinerary "${trip.title}" on GlobeTrotter! ✈️`);
                window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank');
              }}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-colors"
              title="Share on X"
            >
              <Twitter className="w-4 h-4 text-sky-400 fill-sky-400" />
            </button>
          </div>
        </div>

        {/* Title & Author Info */}
        <div className="relative z-10 space-y-3 mt-8">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">{trip.title}</h1>
          {trip.description && (
            <p className="text-sm text-slate-200 max-w-3xl leading-relaxed">{trip.description}</p>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={trip.author_avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${trip.author_name || 'Traveler'}`}
                  alt={trip.author_name}
                  className="w-7 h-7 rounded-full border border-slate-400"
                />
                <span className="font-semibold text-white">Planned by {trip.author_name || 'GlobeTrotter User'}</span>
              </div>
              <span>•</span>
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                {trip.start_date} → {trip.end_date}
              </span>
            </div>

            {/* Main Clone CTA */}
            <button
              onClick={handleCloneTrip}
              disabled={cloning}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 flex items-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>{cloning ? 'Copying Itinerary...' : 'Clone / Copy This Trip to My Account'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stops & Route Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Day-by-Day Timeline / Plan (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
              Day-by-Day Journey Itinerary ({trip.stops?.length || 0} Stops)
            </h2>
            <span className="text-xs text-slate-400">Read-Only View</span>
          </div>

          <TimelineView stops={trip.stops} />
        </div>

        {/* Summary Card & Logistics (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 sticky top-24">
            <div>
              <h3 className="font-bold text-base text-slate-900">Trip Highlights</h3>
              <p className="text-xs text-slate-500 mt-0.5">Route stops and estimated cost summary</p>
            </div>

            {/* Route Stops */}
            <div className="space-y-3">
              {trip.stops && trip.stops.map((stop, i) => (
                <div key={stop.id || i} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="overflow-hidden">
                    <h5 className="font-bold text-xs text-slate-900">{stop.city_name}, {stop.country}</h5>
                    <p className="text-[11px] text-slate-500">{stop.arrival_date} → {stop.departure_date}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cost Estimate Box */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Estimated Total Trip Cost
              </span>
              <span className="text-2xl font-black text-emerald-950 block">
                {formatPrice(trip.total_estimated_cost || 0)}
              </span>
              <p className="text-[11px] text-emerald-800/80">
                Includes transportation, boutique accommodation, and sights.
              </p>
            </div>

            <button
              onClick={handleCloneTrip}
              disabled={cloning}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy to My Trips</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
