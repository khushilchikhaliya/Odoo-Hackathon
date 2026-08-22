import React from 'react';
import { Clock, Star, MapPin, Plus, Check } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function ActivityCard({ activity, onAdd, isAdded, onViewDetails }) {
  const { formatPrice } = useCurrency();

  const getCategoryColor = (category) => {
    switch ((category || '').toLowerCase()) {
      case 'sightseeing':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'food & dining':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'adventure':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'culture':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'nightlife':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Activity Photo */}
        <div className="relative h-40 w-full overflow-hidden bg-slate-100">
          <img
            src={activity.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'}
            alt={activity.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-2.5 left-2.5">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-xs ${getCategoryColor(activity.category)}`}>
              {activity.category}
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-xs font-bold text-slate-800 flex items-center space-x-1 shadow-xs">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{activity.rating || 4.8}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {activity.name}
          </h4>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {activity.description}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {activity.duration_hours || 2} hrs
            </span>

            {activity.city_name && (
              <span className="flex items-center text-slate-600 font-medium">
                <MapPin className="w-3 h-3 mr-0.5 text-emerald-500" />
                {activity.city_name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Price & Action */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Est. Cost</span>
          <span className="text-sm font-bold text-slate-900">
            {activity.cost === 0 ? 'Free' : formatPrice(activity.cost)}
          </span>
        </div>

        {onAdd && (
          <button
            onClick={() => onAdd(activity)}
            disabled={isAdded}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
              isAdded
                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Day</span>
              </>
            )}
          </button>
        )}

        {onViewDetails && !onAdd && (
          <button
            onClick={() => onViewDetails(activity)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Details
          </button>
        )}
      </div>
    </div>
  );
}
