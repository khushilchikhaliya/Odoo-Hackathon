import React from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Calendar,
  DollarSign,
  Hotel,
  Plane
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function TimelineView({ stops, onToggleStatus }) {
  const { formatPrice } = useCurrency();

  if (!stops || stops.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400">
        <p>No stops or timeline entries yet. Add your first city in the builder!</p>
      </div>
    );
  }

  const getTimeSlotColor = (slot) => {
    switch ((slot || '').toLowerCase()) {
      case 'morning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'afternoon':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'evening':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'night':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-10 relative before:absolute before:inset-0 before:left-6 md:before:left-8 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-400 before:to-slate-200">
      {stops.map((stop, stopIdx) => (
        <div key={stop.id || stopIdx} className="relative pl-12 md:pl-16">
          
          {/* Stop Milestone Icon */}
          <div className="absolute left-3.5 md:left-5.5 -top-1 transform -translate-x-1/2 w-8 h-8 rounded-full bg-emerald-600 border-4 border-white shadow-md flex items-center justify-center text-white z-10">
            <span className="text-xs font-bold">{stop.stop_order || stopIdx + 1}</span>
          </div>

          {/* Stop Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white p-5 shadow-sm mb-4 border border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  Stop {stop.stop_order || stopIdx + 1} • {stop.country}
                </span>
                <h3 className="text-2xl font-black mt-0.5">{stop.city_name}</h3>
                <p className="text-xs text-slate-300 flex items-center mt-1">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  {stop.arrival_date} → {stop.departure_date}
                </p>
              </div>

              {/* Transport & Stay Tags */}
              <div className="flex flex-wrap sm:flex-col sm:items-end gap-2 text-xs">
                {stop.transport_type && (
                  <span className="bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 text-slate-200">
                    <Plane className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{stop.transport_type}</span>
                    <span className="text-emerald-400 font-semibold">
                      ({formatPrice(stop.transport_cost || 0)})
                    </span>
                  </span>
                )}
                {stop.accommodation_name && (
                  <span className="bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 text-slate-200">
                    <Hotel className="w-3.5 h-3.5 text-teal-400" />
                    <span className="truncate max-w-[150px]">{stop.accommodation_name}</span>
                    <span className="text-teal-400 font-semibold">
                      ({formatPrice(stop.accommodation_cost || 0)})
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Activities List */}
          <div className="space-y-3">
            {stop.activities && stop.activities.length > 0 ? (
              stop.activities.map((act, actIdx) => (
                <div
                  key={act.id || actIdx}
                  className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    act.status === 'completed'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => onToggleStatus && onToggleStatus(act)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 focus:outline-none transition-colors"
                      title={act.status === 'completed' ? 'Mark Planned' : 'Mark Completed'}
                    >
                      {act.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-500" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase border ${getTimeSlotColor(act.time_slot)}`}>
                          {act.time_slot || 'All Day'}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {act.date}
                        </span>
                      </div>

                      <h4 className={`font-bold text-sm mt-1 ${act.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {act.custom_title || act.name}
                      </h4>

                      {(act.custom_description || act.description) && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {act.custom_description || act.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Duration */}
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-6 text-xs pl-8 sm:pl-0">
                    <span className="flex items-center text-slate-500">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {act.duration_hours || 2} hrs
                    </span>

                    <span className="font-bold text-slate-900 px-2.5 py-1 bg-slate-100 rounded-lg">
                      {act.estimated_cost === 0 ? 'Free' : formatPrice(act.estimated_cost)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">
                No scheduled activities for this stop yet.
              </div>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}
