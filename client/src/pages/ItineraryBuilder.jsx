import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import {
  MapPin,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Plane,
  Hotel,
  DollarSign,
  Eye,
  PieChart,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Search,
  X
} from 'lucide-react';

export default function ItineraryBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [trip, setTrip] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stop Modal
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [accommodationName, setAccommodationName] = useState('');
  const [accommodationCost, setAccommodationCost] = useState('0');
  const [transportType, setTransportType] = useState('Flight');
  const [transportCost, setTransportCost] = useState('0');
  const [stopNotes, setStopNotes] = useState('');

  // Activity Modal
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [targetStopId, setTargetStopId] = useState(null);
  const [availableCityActivities, setAvailableCityActivities] = useState([]);
  const [activityTab, setActivityTab] = useState('catalog'); // 'catalog' or 'custom'
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCategory, setCustomCategory] = useState('Sightseeing');
  const [customDate, setCustomDate] = useState('');
  const [customTimeSlot, setCustomTimeSlot] = useState('Morning');
  const [customCost, setCustomCost] = useState('25');
  const [customDuration, setCustomDuration] = useState('2');

  const loadTripData = async () => {
    try {
      setLoading(true);
      const [tripRes, citiesRes] = await Promise.all([
        api.getTrip(id),
        api.getCities()
      ]);
      setTrip(tripRes.trip);
      setCities(citiesRes.cities || []);
    } catch (err) {
      console.error('Failed to load trip builder data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripData();
  }, [id]);

  // Open Stop Modal
  const handleOpenAddStop = () => {
    setEditingStop(null);
    setSelectedCityId(cities[0]?.id || '');
    setArrivalDate(trip?.start_date || '');
    setDepartureDate(trip?.end_date || '');
    setAccommodationName('');
    setAccommodationCost('0');
    setTransportType('Flight');
    setTransportCost('0');
    setStopNotes('');
    setStopModalOpen(true);
  };

  const handleOpenEditStop = (stop) => {
    setEditingStop(stop);
    setSelectedCityId(stop.city_id);
    setArrivalDate(stop.arrival_date);
    setDepartureDate(stop.departure_date);
    setAccommodationName(stop.accommodation_name || '');
    setAccommodationCost(stop.accommodation_cost || '0');
    setTransportType(stop.transport_type || 'Flight');
    setTransportCost(stop.transport_cost || '0');
    setStopNotes(stop.notes || '');
    setStopModalOpen(true);
  };

  const handleSaveStop = async (e) => {
    e.preventDefault();
    try {
      if (editingStop) {
        await api.updateStop(editingStop.id, {
          city_id: parseInt(selectedCityId),
          arrival_date: arrivalDate,
          departure_date: departureDate,
          accommodation_name: accommodationName,
          accommodation_cost: parseFloat(accommodationCost) || 0,
          transport_type: transportType,
          transport_cost: parseFloat(transportCost) || 0,
          notes: stopNotes
        });
      } else {
        await api.addStop(trip.id, {
          city_id: parseInt(selectedCityId),
          arrival_date: arrivalDate,
          departure_date: departureDate,
          accommodation_name: accommodationName,
          accommodation_cost: parseFloat(accommodationCost) || 0,
          transport_type: transportType,
          transport_cost: parseFloat(transportCost) || 0,
          notes: stopNotes
        });
      }
      setStopModalOpen(false);
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to save stop');
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Delete this destination stop and all its scheduled activities?')) return;
    try {
      await api.deleteStop(stopId);
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to delete stop');
    }
  };

  // Reorder Stops Up/Down
  const handleMoveStop = async (index, direction) => {
    if (!trip?.stops) return;
    const newStops = [...trip.stops];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newStops.length) return;

    const temp = newStops[index];
    newStops[index] = newStops[targetIdx];
    newStops[targetIdx] = temp;

    try {
      const stopIds = newStops.map(s => s.id);
      await api.reorderStops(trip.id, stopIds);
      loadTripData();
    } catch (err) {
      console.error('Failed to reorder stops:', err);
    }
  };

  // Open Activity Modal
  const handleOpenAddActivity = async (stop) => {
    setTargetStopId(stop.id);
    setCustomDate(stop.arrival_date);
    setCustomTitle('');
    setCustomDesc('');
    setCustomCost('25');
    setCustomDuration('2');
    setCustomTimeSlot('Morning');
    setCustomCategory('Sightseeing');

    // Load available activities for this city
    try {
      const res = await api.getActivities({ city_id: stop.city_id });
      setAvailableCityActivities(res.activities || []);
    } catch (err) {
      console.error('Failed to load city activities:', err);
    }

    setActivityModalOpen(true);
  };

  const handleAddCatalogActivity = async (catalogAct) => {
    try {
      await api.addActivity({
        trip_id: trip.id,
        stop_id: targetStopId,
        activity_id: catalogAct.id,
        custom_title: catalogAct.name,
        custom_description: catalogAct.description,
        category: catalogAct.category,
        date: customDate,
        time_slot: customTimeSlot,
        estimated_cost: catalogAct.cost,
        duration_hours: catalogAct.duration_hours,
        status: 'planned'
      });
      setActivityModalOpen(false);
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to add activity');
    }
  };

  const handleAddCustomActivity = async (e) => {
    e.preventDefault();
    if (!customTitle || !customDate) {
      alert('Please provide activity name and date');
      return;
    }
    try {
      await api.addActivity({
        trip_id: trip.id,
        stop_id: targetStopId,
        activity_id: null,
        custom_title: customTitle,
        custom_description: customDesc,
        category: customCategory,
        date: customDate,
        time_slot: customTimeSlot,
        estimated_cost: parseFloat(customCost) || 0,
        duration_hours: parseFloat(customDuration) || 2,
        status: 'planned'
      });
      setActivityModalOpen(false);
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to create activity');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await api.deleteActivity(activityId);
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to delete activity');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading your itinerary workspace...</p>
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

  const totalSpent = trip.summary?.totalEstimatedCost || 0;
  const budget = trip.total_budget || 1000;
  const percentage = Math.min(100, Math.round((totalSpent / budget) * 100));
  const isOver = totalSpent > budget;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Workspace Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <span>Itinerary Builder</span>
            <span>•</span>
            <span className="font-semibold text-emerald-600">{trip.start_date} → {trip.end_date}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{trip.title}</h1>
        </div>

        {/* Quick Navigation Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={`/trips/${trip.id}`}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            <span>Itinerary View</span>
          </Link>

          <Link
            to={`/trips/${trip.id}/budget`}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors"
          >
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>Budget & Charts</span>
          </Link>

          <button
            onClick={handleOpenAddStop}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add City Stop</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Interactive Stops & Activities (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
              Destinations & Daily Activities ({trip.stops?.length || 0})
            </h2>
            <span className="text-xs text-slate-400">Reorder stops using arrows</span>
          </div>

          {trip.stops && trip.stops.length > 0 ? (
            <div className="space-y-6">
              {trip.stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-emerald-200"
                >
                  {/* Stop Header Banner */}
                  <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                      {/* Reorder Arrows */}
                      <div className="flex flex-col space-y-1">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveStop(index, 'up')}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors"
                          title="Move Stop Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={index === trip.stops.length - 1}
                          onClick={() => handleMoveStop(index, 'down')}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors"
                          title="Move Stop Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                        <img
                          src={stop.city_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=200&q=80'}
                          alt={stop.city_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-emerald-400 uppercase">Stop {index + 1}</span>
                          <span className="text-xs text-slate-400">• {stop.country}</span>
                        </div>
                        <h3 className="text-xl font-bold">{stop.city_name}</h3>
                        <p className="text-xs text-slate-300 flex items-center mt-0.5">
                          <Calendar className="w-3 h-3 mr-1 text-emerald-400" />
                          {stop.arrival_date} → {stop.departure_date}
                        </p>
                      </div>
                    </div>

                    {/* Stop Header Actions */}
                    <div className="flex items-center space-x-2 sm:justify-end">
                      <button
                        onClick={() => handleOpenEditStop(stop)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1"
                        title="Edit Stop Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteStop(stop.id)}
                        className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-medium flex items-center space-x-1"
                        title="Delete Stop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stop Logistics Details (Stay & Transport) */}
                  <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200">
                      <Plane className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Transport</span>
                        <span className="font-bold text-slate-800">
                          {stop.transport_type || 'Flight'} — {formatPrice(stop.transport_cost || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200">
                      <Hotel className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Accommodation</span>
                        <span className="font-bold text-slate-800 truncate block">
                          {stop.accommodation_name || 'Hotel Stay'} — {formatPrice(stop.accommodation_cost || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activities List */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Activities & Itinerary ({stop.activities?.length || 0})
                      </h4>
                      <button
                        onClick={() => handleOpenAddActivity(stop)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Activity</span>
                      </button>
                    </div>

                    {stop.activities && stop.activities.length > 0 ? (
                      <div className="space-y-2">
                        {stop.activities.map((act) => (
                          <div
                            key={act.id}
                            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                                {act.time_slot || 'Day'}
                              </span>
                              <div>
                                <h5 className="font-bold text-sm text-slate-900">{act.custom_title}</h5>
                                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                                  <span>{act.date}</span>
                                  <span>•</span>
                                  <span>{act.duration_hours || 2} hrs</span>
                                  <span>•</span>
                                  <span className="text-emerald-600 font-semibold">{act.category}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                                {act.estimated_cost === 0 ? 'Free' : formatPrice(act.estimated_cost)}
                              </span>
                              <button
                                onClick={() => handleDeleteActivity(act.id)}
                                className="text-slate-400 hover:text-red-500 p-1"
                                title="Remove Activity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <p className="text-xs text-slate-400">No activities assigned for this city yet.</p>
                        <button
                          onClick={() => handleOpenAddActivity(stop)}
                          className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
                        >
                          + Explore & add things to do
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <MapPin className="w-12 h-12 text-emerald-500 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Your itinerary is empty</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Add your first city stop to begin constructing your customized day-by-day travel route.
                </p>
              </div>
              <button
                onClick={handleOpenAddStop}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                + Add First City Stop
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Budget Computation & Actions (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 sticky top-24">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-1 text-emerald-600" />
                Live Budget Tracker
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Auto-updates with every addition</p>
            </div>

            {/* Total Budget Meter */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Target Budget</span>
                <span className="font-bold text-slate-900">{formatPrice(budget)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Estimated</span>
                <span className={`font-bold ${isOver ? 'text-red-600' : 'text-emerald-700'}`}>
                  {formatPrice(totalSpent)}
                </span>
              </div>

              {/* Progress */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOver ? 'bg-red-500' : percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500">
                  {isOver
                    ? `Over budget by ${formatPrice(totalSpent - budget)}`
                    : `${formatPrice(budget - totalSpent)} remaining (${100 - percentage}%)`}
                </span>
              </div>
            </div>

            {/* Category Subtotals */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Breakdown</span>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Accommodations</span>
                <span className="font-semibold">{formatPrice(trip.summary?.totalAccom || 0)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Transportation</span>
                <span className="font-semibold">{formatPrice(trip.summary?.totalTransport || 0)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Activities & Sights</span>
                <span className="font-semibold">{formatPrice(trip.summary?.totalActivities || 0)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2">
              <Link
                to={`/trips/${trip.id}`}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center block shadow-sm transition-all"
              >
                Finish & View Full Itinerary
              </Link>
              <Link
                to={`/trips/${trip.id}/budget`}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs text-center block hover:bg-slate-50 transition-colors"
              >
                Inspect Detailed Cost Breakdown
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Add / Edit Stop Modal */}
      {stopModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStop ? 'Edit Destination Stop' : 'Add New City Stop'}
              </h3>
              <button onClick={() => setStopModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select City</label>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.country} ({c.region})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Arrival Date</label>
                  <input
                    type="date"
                    required
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Departure Date</label>
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Accommodation Name</label>
                  <input
                    type="text"
                    value={accommodationName}
                    onChange={(e) => setAccommodationName(e.target.value)}
                    placeholder="e.g. Hotel Le Marais"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stay Cost</label>
                  <input
                    type="number"
                    value={accommodationCost}
                    onChange={(e) => setAccommodationCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Transport Mode</label>
                  <select
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Flight">Flight</option>
                    <option value="Train">High-Speed Train</option>
                    <option value="Bus">Bus / Coach</option>
                    <option value="Car">Rental Car</option>
                    <option value="Ferry">Ferry / Boat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Transport Cost</label>
                  <input
                    type="number"
                    value={transportCost}
                    onChange={(e) => setTransportCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStopModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Save Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal (Catalog + Custom) */}
      {activityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Activity to Stop</h3>
                <p className="text-xs text-slate-500">Choose from curated attractions or create custom plan</p>
              </div>
              <button onClick={() => setActivityModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab switchers */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActivityTab('catalog')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
                  activityTab === 'catalog'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Curated City Activities ({availableCityActivities.length})
              </button>
              <button
                type="button"
                onClick={() => setActivityTab('custom')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
                  activityTab === 'custom'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                + Custom Activity
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-4">
              {activityTab === 'catalog' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Target Date</label>
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Time Slot</label>
                      <select
                        value={customTimeSlot}
                        onChange={(e) => setCustomTimeSlot(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                  </div>

                  {availableCityActivities.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {availableCityActivities.map((act) => (
                        <div
                          key={act.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4 hover:border-emerald-300 transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={act.image_url}
                              alt={act.name}
                              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                            />
                            <div>
                              <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                                {act.category}
                              </span>
                              <h5 className="font-bold text-sm text-slate-900 mt-0.5">{act.name}</h5>
                              <p className="text-xs text-slate-500 line-clamp-1">{act.description}</p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-bold text-slate-900 block mb-1.5">
                              {act.cost === 0 ? 'Free' : formatPrice(act.cost)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddCatalogActivity(act)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                            >
                              Add to Plan
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-xs text-slate-400">
                      No pre-curated activities for this city yet. Switch to Custom Activity tab above!
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleAddCustomActivity} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Activity Title *</label>
                    <input
                      type="text"
                      required
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. Cooking Workshop, Boat Rental"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows="2"
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      placeholder="Notes or details..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                      <select
                        value={customTimeSlot}
                        onChange={(e) => setCustomTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      >
                        <option value="Sightseeing">Sightseeing</option>
                        <option value="Food & Dining">Food & Dining</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Culture">Culture</option>
                        <option value="Nightlife">Nightlife</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Est. Cost</label>
                      <input
                        type="number"
                        value={customCost}
                        onChange={(e) => setCustomCost(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Hours)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                    >
                      Save Custom Activity
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
