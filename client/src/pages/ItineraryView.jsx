import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import TimelineView from '../components/TimelineView';
import CalendarView from '../components/CalendarView';
import ShareModal from '../components/ShareModal';
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Share2,
  Edit3,
  PieChart,
  Printer,
  Download,
  List,
  LayoutGrid,
  CheckCircle2,
  Circle,
  Hotel,
  Plane,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ItineraryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'timeline', 'calendar'
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const res = await api.getTrip(id);
      setTrip(res.trip);
    } catch (err) {
      console.error('Failed to load trip itinerary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrip();
  }, [id]);

  const handleToggleActivityStatus = async (activity) => {
    try {
      const nextStatus = activity.status === 'completed' ? 'planned' : 'completed';
      await api.updateActivity(activity.id, { status: nextStatus });
      loadTrip();
    } catch (err) {
      console.error('Failed to update activity status:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading your travel itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">Trip itinerary not found</p>
        <Link to="/trips" className="text-emerald-600 font-bold mt-2 inline-block">Back to My Trips</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      
      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-xl min-h-[300px] flex flex-col justify-end p-6 sm:p-10 text-white">
        <img
          src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40 print:hidden"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/80 text-white backdrop-blur-md">
                {trip.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-emerald-300">
                {trip.travel_style || 'Balanced'}
              </span>
            </div>

            {/* Print & Action Buttons */}
            <div className="flex items-center space-x-2 print:hidden">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-bold text-white flex items-center space-x-1.5 transition-colors"
                title="Print or Save PDF"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>

              <button
                onClick={() => setShareModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-bold text-white flex items-center space-x-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Share</span>
              </button>

              <Link
                to={`/trips/${trip.id}/builder`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md flex items-center space-x-1.5 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Builder</span>
              </Link>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{trip.title}</h1>
            {trip.description && (
              <p className="text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">{trip.description}</p>
            )}
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-8 text-xs text-slate-300">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{trip.start_date} → {trip.end_date}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{trip.stops?.length || 0} Destination Stops</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>
                Total Est: <b className="text-white font-bold">{formatPrice(trip.summary?.totalEstimatedCost || 0)}</b> / {formatPrice(trip.total_budget || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Day-Wise List</span>
          </button>

          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Timeline</span>
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar Grid</span>
          </button>
        </div>

        <Link
          to={`/trips/${trip.id}/budget`}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
        >
          <PieChart className="w-4 h-4" />
          <span>View Detailed Budget & Charts →</span>
        </Link>
      </div>

      {/* Main View Render */}
      {viewMode === 'list' && (
        <div className="space-y-8">
          {trip.stops && trip.stops.length > 0 ? (
            trip.stops.map((stop, stopIdx) => (
              <div
                key={stop.id || stopIdx}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* City Stop Header */}
                <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0">
                      <img
                        src={stop.city_image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80'}
                        alt={stop.city_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase">
                          Stop {stop.stop_order || stopIdx + 1}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{stop.country}</span>
                      </div>
                      <h3 className="text-2xl font-black mt-0.5">{stop.city_name}</h3>
                      <p className="text-xs text-slate-300 flex items-center mt-1">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        {stop.arrival_date} → {stop.departure_date}
                      </p>
                    </div>
                  </div>

                  {/* Stop Logistics Subtotal */}
                  <div className="flex flex-wrap sm:flex-col sm:items-end gap-2 text-xs">
                    {stop.accommodation_name && (
                      <span className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg text-slate-200 flex items-center space-x-1.5">
                        <Hotel className="w-3.5 h-3.5 text-teal-400" />
                        <span>{stop.accommodation_name}</span>
                        <span className="text-teal-400 font-bold">({formatPrice(stop.accommodation_cost || 0)})</span>
                      </span>
                    )}
                    {stop.transport_type && (
                      <span className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg text-slate-200 flex items-center space-x-1.5">
                        <Plane className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{stop.transport_type}</span>
                        <span className="text-emerald-400 font-bold">({formatPrice(stop.transport_cost || 0)})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Scheduled Activities */}
                <div className="p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Scheduled Activities ({stop.activities?.length || 0})
                  </h4>

                  {stop.activities && stop.activities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stop.activities.map((act) => (
                        <div
                          key={act.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            act.status === 'completed'
                              ? 'bg-slate-50 border-slate-200 opacity-75'
                              : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold uppercase text-[10px]">
                                {act.time_slot || 'Anytime'} • {act.date}
                              </span>
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                                {act.estimated_cost === 0 ? 'Free' : formatPrice(act.estimated_cost)}
                              </span>
                            </div>

                            <div className="flex items-start space-x-3">
                              <button
                                onClick={() => handleToggleActivityStatus(act)}
                                className="mt-0.5 text-slate-400 hover:text-emerald-600 focus:outline-none flex-shrink-0"
                              >
                                {act.status === 'completed' ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-300" />
                                )}
                              </button>

                              <div>
                                <h5 className={`font-bold text-sm text-slate-900 ${act.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                                  {act.custom_title}
                                </h5>
                                {act.custom_description && (
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    {act.custom_description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                            <span className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              {act.duration_hours || 2} hours
                            </span>
                            <span className="font-semibold text-slate-600">{act.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-400 text-xs">
                      No activities planned yet for this city.
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <MapPin className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No stops created</h3>
              <p className="text-xs text-slate-500">Go to the builder to add cities and dates to your itinerary.</p>
              <Link
                to={`/trips/${trip.id}/builder`}
                className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Open Itinerary Builder
              </Link>
            </div>
          )}
        </div>
      )}

      {viewMode === 'timeline' && (
        <TimelineView stops={trip.stops} onToggleStatus={handleToggleActivityStatus} />
      )}

      {viewMode === 'calendar' && (
        <CalendarView trip={trip} stops={trip.stops} />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        trip={trip}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}
