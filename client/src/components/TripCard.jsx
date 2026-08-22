import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  DollarSign,
  MoreVertical,
  Share2,
  Copy,
  Trash2,
  Edit3,
  PieChart,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function TripCard({ trip, onDelete, onDuplicate, onShare }) {
  const { formatPrice } = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);

  const calculateDays = (start, end) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const diff = Math.abs(e - s);
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
    } catch {
      return 1;
    }
  };

  const days = calculateDays(trip.start_date, trip.end_date);
  const budget = trip.total_budget || 1000;
  const spent = trip.total_estimated_cost || 0;
  const percentage = Math.min(100, Math.round((spent / budget) * 100));
  const isOver = spent > budget;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ongoing':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Cover Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-xs ${getStatusBadge(trip.status)}`}>
            {trip.status}
          </span>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900/90 focus:outline-none transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 text-xs font-semibold text-slate-700"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link
                  to={`/trips/${trip.id}`}
                  className="flex items-center px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                >
                  <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  View Itinerary
                </Link>
                <Link
                  to={`/trips/${trip.id}/builder`}
                  className="flex items-center px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  Edit / Builder
                </Link>
                <Link
                  to={`/trips/${trip.id}/budget`}
                  className="flex items-center px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                >
                  <PieChart className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  Cost Breakdown
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onShare(trip);
                  }}
                  className="w-full text-left flex items-center px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                >
                  <Share2 className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  Share Itinerary
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDuplicate(trip.id);
                  }}
                  className="w-full text-left flex items-center px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                >
                  <Copy className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  Clone Trip
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(trip.id);
                  }}
                  className="w-full text-left flex items-center px-3.5 py-2 hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2 text-red-500" />
                  Delete Trip
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Title & Dates Overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-emerald-300 transition-colors">
            {trip.title}
          </h3>
          <div className="flex items-center space-x-2 text-xs text-slate-200 mt-1">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              {trip.start_date} → {trip.end_date}
            </span>
            <span>•</span>
            <span className="font-semibold text-emerald-300">{days} Days</span>
          </div>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Stops Summary */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              {trip.stop_count || 0} {trip.stop_count === 1 ? 'Stop' : 'Stops'}
            </span>
            <span className="text-[11px] text-slate-400">
              {trip.activity_count || 0} activities planned
            </span>
          </div>

          {/* City Chips */}
          <div className="flex flex-wrap gap-1.5">
            {trip.stops && trip.stops.length > 0 ? (
              trip.stops.slice(0, 3).map((stop, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                >
                  {stop.city_name}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No stops added yet</span>
            )}
            {trip.stops && trip.stops.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px]">
                +{trip.stops.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Budget Meter */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
              Budget: <b className="ml-1 text-slate-900">{formatPrice(budget)}</b>
            </span>
            <span className={`font-bold ${isOver ? 'text-red-600 flex items-center' : 'text-emerald-700'}`}>
              {isOver && <AlertCircle className="w-3 h-3 mr-1" />}
              {formatPrice(spent)} spent ({percentage}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOver ? 'bg-red-500' : percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>

        {/* Card CTAs */}
        <div className="pt-2 flex items-center gap-2">
          <Link
            to={`/trips/${trip.id}`}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
          >
            View Plan
          </Link>
          <Link
            to={`/trips/${trip.id}/builder`}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-center bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-colors"
          >
            Edit Trip
          </Link>
        </div>
      </div>
    </div>
  );
}
