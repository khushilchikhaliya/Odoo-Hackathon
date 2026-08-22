import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import ActivityCard from '../components/ActivityCard';
import {
  Activity,
  Search,
  SlidersHorizontal,
  Compass,
  Star,
  Clock,
  DollarSign,
  MapPin,
  X,
  Plus
} from 'lucide-react';

const CATEGORIES = ['all', 'Sightseeing', 'Food & Dining', 'Adventure', 'Culture', 'Nightlife'];

export default function ActivityExplore() {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [activities, setActivities] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxCost, setMaxCost] = useState('150');
  const [sortOption, setSortOption] = useState('rating');

  // Detail & Add Modal
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [targetStopId, setTargetStopId] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [activityTimeSlot, setActivityTimeSlot] = useState('Morning');

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCityId !== 'all') params.city_id = selectedCityId;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (maxCost) params.max_cost = maxCost;
      if (sortOption) params.sort = sortOption;

      const [actRes, cityRes, tripsRes] = await Promise.all([
        api.getActivities(params),
        api.getCities(),
        api.getTrips().catch(() => ({ trips: [] }))
      ]);

      setActivities(actRes.activities || []);
      setCities(cityRes.cities || []);
      setTrips(tripsRes.trips || []);
      if (tripsRes.trips?.length > 0) {
        setSelectedTrip(tripsRes.trips[0]);
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [selectedCityId, selectedCategory, maxCost, sortOption]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadActivities();
  };

  const handleOpenAddModal = async (activity) => {
    setSelectedActivity(activity);
    if (trips.length > 0) {
      // Load detailed stops for first trip
      try {
        const fullTripRes = await api.getTrip(trips[0].id);
        setSelectedTrip(fullTripRes.trip);
        if (fullTripRes.trip.stops && fullTripRes.trip.stops.length > 0) {
          setTargetStopId(fullTripRes.trip.stops[0].id);
          setActivityDate(fullTripRes.trip.stops[0].arrival_date);
        }
      } catch (err) {
        console.error('Failed to fetch full trip details:', err);
      }
    }
  };

  const handleTripSelectionChange = async (tripId) => {
    try {
      const res = await api.getTrip(tripId);
      setSelectedTrip(res.trip);
      if (res.trip.stops && res.trip.stops.length > 0) {
        setTargetStopId(res.trip.stops[0].id);
        setActivityDate(res.trip.stops[0].arrival_date);
      } else {
        setTargetStopId('');
      }
    } catch (err) {
      console.error('Failed to load selected trip stops:', err);
    }
  };

  const handleConfirmAddActivity = async (e) => {
    e.preventDefault();
    if (!selectedTrip || !targetStopId || !activityDate) {
      alert('Please ensure you have selected a trip with at least one destination stop.');
      return;
    }

    try {
      await api.addActivity({
        trip_id: selectedTrip.id,
        stop_id: parseInt(targetStopId),
        activity_id: selectedActivity.id,
        custom_title: selectedActivity.name,
        custom_description: selectedActivity.description,
        category: selectedActivity.category,
        date: activityDate,
        time_slot: activityTimeSlot,
        estimated_cost: selectedActivity.cost,
        duration_hours: selectedActivity.duration_hours,
        status: 'planned'
      });

      alert(`Added "${selectedActivity.name}" to your itinerary!`);
      setSelectedActivity(null);
      navigate(`/trips/${selectedTrip.id}/builder`);
    } catch (err) {
      alert(err.message || 'Failed to assign activity');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Activity className="w-3.5 h-3.5" />
          <span>Curated Experiences</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Travel Activities</h1>
        <p className="text-sm text-slate-500 mt-1">
          Browse guided museum tours, authentic culinary crawls, outdoor adventures, and evening experiences
        </p>
      </div>

      {/* Filter Workspace */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search experiences, tours, food crawls..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Category Pills & Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* City Filter */}
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">City: All Cities</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Max Cost Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-500">Max Cost:</span>
              <select
                value={maxCost}
                onChange={(e) => setMaxCost(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none"
              >
                <option value="30">Under $30</option>
                <option value="60">Under $60</option>
                <option value="100">Under $100</option>
                <option value="200">Under $200</option>
                <option value="1000">Any Price</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onAdd={handleOpenAddModal}
              onViewDetails={handleOpenAddModal}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <Activity className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No experiences match your filter</h3>
          <p className="text-xs text-slate-500">Try widening your price range or switching category filters.</p>
        </div>
      )}

      {/* Add Activity to Trip Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add to Itinerary</h3>
              <button onClick={() => setSelectedActivity(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Activity Preview */}
            <div className="flex items-center space-x-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={selectedActivity.image_url}
                alt={selectedActivity.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                  {selectedActivity.category}
                </span>
                <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">{selectedActivity.name}</h4>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-bold text-slate-800">{formatPrice(selectedActivity.cost)}</span>
                  <span>•</span>
                  <span>{selectedActivity.duration_hours || 2} hours</span>
                </div>
              </div>
            </div>

            {trips.length > 0 ? (
              <form onSubmit={handleConfirmAddActivity} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Trip</label>
                  <select
                    value={selectedTrip?.id || ''}
                    onChange={(e) => handleTripSelectionChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTrip?.stops && selectedTrip.stops.length > 0 ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Select City Stop</label>
                      <select
                        value={targetStopId}
                        onChange={(e) => setTargetStopId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                      >
                        {selectedTrip.stops.map((stop) => (
                          <option key={stop.id} value={stop.id}>
                            Stop {stop.stop_order}: {stop.city_name} ({stop.arrival_date} → {stop.departure_date})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                        <input
                          type="date"
                          required
                          value={activityDate}
                          onChange={(e) => setActivityDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                        <select
                          value={activityTimeSlot}
                          onChange={(e) => setActivityTimeSlot(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Morning">Morning</option>
                          <option value="Afternoon">Afternoon</option>
                          <option value="Evening">Evening</option>
                          <option value="Night">Night</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
                    This trip doesn't have any destination stops yet. Please add a city stop first in the builder.
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedActivity(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedTrip?.stops || selectedTrip.stops.length === 0}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-sm"
                  >
                    Confirm & Add to Day
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-500">You don't have an active trip yet to add this activity to.</p>
                <button
                  onClick={() => {
                    setSelectedActivity(null);
                    navigate('/trips/new');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
                >
                  Create a New Trip
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
