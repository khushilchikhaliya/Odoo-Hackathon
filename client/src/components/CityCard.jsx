import React from 'react';
import { MapPin, Star, Plus, DollarSign } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function CityCard({ city, onSelect, onAddToTrip, isSaved, onToggleSave }) {
  const { formatPrice } = useCurrency();

  const renderCostIndex = (index) => {
    return (
      <span className="flex items-center text-xs font-bold text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < index ? 'text-emerald-600' : 'text-slate-200'}>
            $
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={city.image_url}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80" />
        
        {/* Popularity Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center space-x-1 shadow-sm">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{city.popularity_score}% Popular</span>
        </div>

        {/* Region Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-medium">
          {city.region}
        </div>

        {/* City Title Overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-xl font-bold tracking-tight">{city.name}</h3>
          <p className="text-xs text-slate-200 flex items-center mt-0.5">
            <MapPin className="w-3 h-3 mr-1 text-emerald-400" />
            {city.country}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {city.description}
        </p>

        {/* Meta Stats */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cost Index</span>
            <div className="mt-0.5">{renderCostIndex(city.cost_index)}</div>
          </div>

          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Avg. Daily</span>
            <span className="font-bold text-slate-800">{formatPrice(city.avg_daily_cost)}/day</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center space-x-2">
          {onSelect && (
            <button
              onClick={() => onSelect(city)}
              className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-center"
            >
              View Details
            </button>
          )}

          {onAddToTrip && (
            <button
              onClick={() => onAddToTrip(city)}
              className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center space-x-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Trip</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
