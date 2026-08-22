import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import CityCard from '../components/CityCard';
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  Compass,
  Plus,
  Heart,
  Globe,
  DollarSign,
  X,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const REGIONS = ['all', 'Europe', 'Asia', 'North America', 'Africa', 'Oceania', 'Middle East'];

export default function CityExplore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCityId = searchParams.get('id');

  const { formatPrice } = useCurrency();

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [costFilter, setCostFilter] = useState('all');
  const [sortOption, setSortOption] = useState('popularity');

  // City Detail Modal
  const [selectedCity, setSelectedCity] = useState(null);
  const [savedCityIds, setSavedCityIds] = useState(new Set());
  const [trips, setTrips] = useState([]);

  // Add to Trip Modal
  const [addToTripModalCity, setAddToTripModalCity] = useState(null);
  const [targetTripId, setTargetTripId] = useState('');

  const loadCities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (regionFilter !== 'all') params.region = regionFilter;
      if (costFilter !== 'all') params.cost_index = costFilter;
      if (sortOption) params.sort = sortOption;

      const res = await api.getCities(params);
      setCities(res.cities || []);

      if (initialCityId) {
        const target = res.cities.find(c => c.id === parseInt(initialCityId));
        if (target) handleOpenCityDetails(target);
      }
    } catch (err) {
      console.error('Failed to load cities:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSavedAndTrips = async () => {
    try {
      const [profileRes, tripsRes] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getTrips().catch(() => null)
      ]);

      if (profileRes?.savedDestinations) {
        setSavedCityIds(new Set(profileRes.savedDestinations.map(c => c.id)));
      }
      if (tripsRes?.trips) {
        setTrips(tripsRes.trips);
        if (tripsRes.trips.length > 0) {
          setTargetTripId(tripsRes.trips[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load user wishlist/trips:', err);
    }
  };

  useEffect(() => {
    loadCities();
    loadUserSavedAndTrips();
  }, [regionFilter, costFilter, sortOption]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCities();
  };

  const handleOpenCityDetails = async (city) => {
    try {
      const res = await api.getCity(city.id);
      setSelectedCity(res.city);
    } catch (err) {
      setSelectedCity(city);
    }
  };

  const handleToggleSave = async (cityId) => {
    try {
      const res = await api.toggleSavedDestination(cityId);
      setSavedCityIds(prev => {
        const next = new Set(prev);
        if (res.saved) next.add(cityId);
        else next.delete(cityId);
        return next;
      });
    } catch (err) {
      alert(err.message || 'Please log in to save destinations');
    }
  };

  const handleConfirmAddToTrip = async (e) => {
    e.preventDefault();
    if (!targetTripId || !addToTripModalCity) return;

    try {
      const targetTrip = trips.find(t => t.id === parseInt(targetTripId));
      await api.addStop(targetTripId, {
        city_id: addToTripModalCity.id,
        arrival_date: targetTrip ? targetTrip.start_date : '2026-09-15',
        departure_date: targetTrip ? targetTrip.end_date : '2026-09-18',
        accommodation_name: `${addToTripModalCity.name} Hotel`,
        accommodation_cost: addToTripModalCity.avg_daily_cost * 2,
        transport_type: 'Flight',
        transport_cost: 150
      });

      alert(`Added ${addToTripModalCity.name} to ${targetTrip?.title || 'your trip'}!`);
      setAddToTripModalCity(null);
      navigate(`/trips/${targetTripId}/builder`);
    } catch (err) {
      alert(err.message || 'Failed to add stop');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Destination Catalog</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Global Cities</h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover vibrant cultural capitals, coastal retreats, and bucket-list travel stops
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city name, country, or description..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-colors"
          >
            Search
          </button>
        </form>

        {/* Region & Cost Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Region Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setRegionFilter(region)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors flex-shrink-0 ${
                  regionFilter === region
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {region === 'all' ? 'All Regions' : region}
              </button>
            ))}
          </div>

          {/* Cost & Sort Selectors */}
          <div className="flex items-center space-x-2">
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">Cost: All</option>
              <option value="1">$ Budget (Low Cost)</option>
              <option value="2">$$ Moderate</option>
              <option value="3">$$$ Standard</option>
              <option value="4">$$$$ High End</option>
              <option value="5">$$$$$ Luxury</option>
            </select>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="popularity">Sort: Most Popular</option>
              <option value="cost_asc">Cost: Low to High</option>
              <option value="cost_desc">Cost: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* City Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : cities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              isSaved={savedCityIds.has(city.id)}
              onToggleSave={handleToggleSave}
              onSelect={handleOpenCityDetails}
              onAddToTrip={(c) => setAddToTripModalCity(c)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <MapPin className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No destinations found</h3>
          <p className="text-xs text-slate-500">Try adjusting your region filter or search keywords.</p>
        </div>
      )}

      {/* City Details Modal */}
      {selectedCity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 overflow-hidden">
            {/* Modal Cover Image */}
            <div className="relative h-64 w-full overflow-hidden bg-slate-900">
              <img
                src={selectedCity.image_url}
                alt={selectedCity.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <button
                onClick={() => setSelectedCity(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider">
                  {selectedCity.region}
                </span>
                <h3 className="text-3xl font-black mt-1">{selectedCity.name}, {selectedCity.country}</h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 pt-0 space-y-6">
              <p className="text-sm text-slate-600 leading-relaxed">{selectedCity.description}</p>

              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Popularity</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedCity.popularity_score}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg. Daily Cost</span>
                  <span className="font-bold text-emerald-600 text-sm">{formatPrice(selectedCity.avg_daily_cost)}/day</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cost Index</span>
                  <span className="font-bold text-slate-900 text-sm">Level {selectedCity.cost_index} of 5</span>
                </div>
              </div>

              {/* City Activities */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3">Top Recommended Things to Do</h4>
                {selectedCity.activities && selectedCity.activities.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCity.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                            {act.category}
                          </span>
                          <h5 className="font-bold text-xs text-slate-900 mt-1">{act.name}</h5>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{act.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold text-xs text-slate-900 block">
                            {act.cost === 0 ? 'Free' : formatPrice(act.cost)}
                          </span>
                          <span className="text-[10px] text-slate-400">{act.duration_hours || 2} hrs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No activities cataloged yet for this city.</p>
                )}
              </div>

              {/* Modal CTAs */}
              <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleToggleSave(selectedCity.id)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                    savedCityIds.has(selectedCity.id)
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${savedCityIds.has(selectedCity.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{savedCityIds.has(selectedCity.id) ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity(null);
                    setAddToTripModalCity(selectedCity);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Trip Itinerary</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Trip Modal Selection */}
      {addToTripModalCity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Add {addToTripModalCity.name} to Itinerary
              </h3>
              <button onClick={() => setAddToTripModalCity(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {trips.length > 0 ? (
              <form onSubmit={handleConfirmAddToTrip} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Active Trip</label>
                  <select
                    value={targetTripId}
                    onChange={(e) => setTargetTripId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.start_date} → {t.end_date})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddToTripModalCity(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    Add Stop & Open Builder
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center py-4">
                <p className="text-xs text-slate-500">You don't have any trips created yet.</p>
                <button
                  onClick={() => {
                    const city = addToTripModalCity;
                    setAddToTripModalCity(null);
                    navigate(`/trips/new?city_id=${city.id}`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
                >
                  Start New Trip with {addToTripModalCity.name}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
