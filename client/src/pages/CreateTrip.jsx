import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import {
  Compass,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Tag,
  Clock,
  Layers
} from 'lucide-react';

const COVER_PRESETS = [
  {
    title: 'Parisian Charm',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Tokyo Neon Lights',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Roman Heritage',
    url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Tropical Bali Paradise',
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'New York Skylines',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Mediterranean Coast',
    url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1000&q=80',
  },
];

const TRAVEL_STYLES = [
  'Adventure & Outdoor',
  'Culture & History',
  'Food & Culinary',
  'Luxury & Wellness',
  'Budget Backpacker',
  'Balanced Exploration'
];

export default function CreateTrip() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCityId = searchParams.get('city_id');

  const { currency: defaultCurrency } = useCurrency();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalBudget, setTotalBudget] = useState('1500');
  const [currency, setCurrency] = useState(defaultCurrency || 'USD');
  const [travelStyle, setTravelStyle] = useState('Balanced Exploration');
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState(initialCityId || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCities() {
      try {
        const res = await api.getCities();
        setCities(res.cities || []);
        if (initialCityId) {
          const selected = res.cities.find(c => c.id === parseInt(initialCityId));
          if (selected) {
            setTitle(`${selected.name} Getaway`);
            setDescription(`Exploring the best of ${selected.name}, ${selected.country}.`);
            if (selected.image_url) setCoverImage(selected.image_url);
          }
        }
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    }
    loadCities();
  }, [initialCityId]);

  // Compute duration in days
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e < s) return 0;
    const diff = Math.abs(e - s);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const durationDays = calculateDays();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      alert('Please fill in trip title, start date, and end date');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('End date cannot be earlier than start date');
      return;
    }

    setLoading(true);
    try {
      const finalCover = customCoverUrl.trim() || coverImage;
      const initialStops = selectedCityId ? [{
        city_id: parseInt(selectedCityId),
        arrival_date: startDate,
        departure_date: endDate,
        accommodation_name: 'Hotel Reservation',
        accommodation_cost: 200,
        transport_type: 'Flight',
        transport_cost: 150
      }] : [];

      const res = await api.createTrip({
        title,
        description,
        cover_image: finalCover,
        start_date: startDate,
        end_date: endDate,
        total_budget: parseFloat(totalBudget) || 1000,
        currency,
        travel_style: travelStyle,
        is_public: 1,
        stops: initialStops
      });

      // Navigate straight to Itinerary Builder if trip ID exists
      if (res && res.trip && res.trip.id) {
        navigate(`/trips/${res.trip.id}/builder`);
      } else {
        navigate('/trips');
      }
    } catch (err) {
      alert(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of Planning</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Create New Travel Plan</h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Set up the basics of your journey. You'll add stops, assign day-wise activities, and configure transport on the next screen.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
        
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <Compass className="w-5 h-5 mr-2 text-emerald-600" />
            Trip Overview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trip Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 10-Day European Highlights Tour"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Trip Description</label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of your itinerary goals, travel companions, and notes..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Destination City (Optional)
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => {
                  setSelectedCityId(e.target.value);
                  const found = cities.find(c => c.id === parseInt(e.target.value));
                  if (found && !title) setTitle(`${found.name} Getaway`);
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose Starting City --</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Travel Style</label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {TRAVEL_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dates & Budget */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
            Schedule & Budget
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{durationDays > 0 ? `${durationDays} Total Days` : 'Pick Dates'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Budget</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="INR">INR (₹)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cover Image Selection */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-emerald-600" />
            Cover Image
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COVER_PRESETS.map((preset, i) => (
              <button
                type="button"
                key={i}
                onClick={() => {
                  setCoverImage(preset.url);
                  setCustomCoverUrl('');
                }}
                className={`relative h-28 rounded-2xl overflow-hidden border-2 transition-all group ${
                  coverImage === preset.url && !customCoverUrl
                    ? 'border-emerald-600 ring-2 ring-emerald-400/50 scale-[1.02]'
                    : 'border-transparent hover:border-slate-300'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-white text-xs font-bold truncate">{preset.title}</span>
                </div>
                {coverImage === preset.url && !customCoverUrl && (
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Or Custom Cover Photo URL (Optional)
            </label>
            <input
              type="url"
              value={customCoverUrl}
              onChange={(e) => setCustomCoverUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/trips')}
            className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all flex items-center space-x-2"
          >
            <span>{loading ? 'Creating Trip...' : 'Proceed to Itinerary Builder'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
}
