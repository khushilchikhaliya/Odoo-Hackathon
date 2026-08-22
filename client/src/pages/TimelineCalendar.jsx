import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import CalendarView from '../components/CalendarView';
import TimelineView from '../components/TimelineView';
import { Calendar, Layers, Clock, MapPin, Edit3, ArrowLeft, Eye } from 'lucide-react';

export default function TimelineCalendar() {
  const { id } = useParams();
  const { formatPrice } = useCurrency();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState('calendar'); // 'calendar' or 'timeline'

  const loadTrip = async () => {
    try {
      setLoading(true);
      const res = await api.getTrip(id);
      setTrip(res.trip);
    } catch (err) {
      console.error('Failed to load timeline trip:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrip();
  }, [id]);

  const handleToggleStatus = async (activity) => {
    try {
      const nextStatus = activity.status === 'completed' ? 'planned' : 'completed';
      await api.updateActivity(activity.id, { status: nextStatus });
      loadTrip();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading timeline visualizer...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">Trip not found</p>
        <Link to="/trips" className="text-emerald-600 font-bold mt-2 inline-block">Back to My Trips</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link to={`/trips/${id}`} className="hover:text-emerald-600 font-medium">Itinerary View</Link>
            <span>•</span>
            <span className="font-semibold text-emerald-600">Timeline & Calendar Visualizer</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{trip.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{trip.start_date} → {trip.end_date}</p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center space-x-2">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewTab('calendar')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewTab === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Calendar Grid</span>
            </button>
            <button
              onClick={() => setViewTab('timeline')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewTab === 'timeline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vertical Timeline</span>
            </button>
          </div>

          <Link
            to={`/trips/${trip.id}/builder`}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Builder</span>
          </Link>
        </div>
      </div>

      {/* Main View */}
      {viewTab === 'calendar' ? (
        <CalendarView trip={trip} stops={trip.stops} />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <TimelineView stops={trip.stops} onToggleStatus={handleToggleStatus} />
        </div>
      )}

    </div>
  );
}
