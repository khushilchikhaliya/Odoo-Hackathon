import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function CalendarView({ trip, stops }) {
  const { formatPrice } = useCurrency();
  const [selectedDate, setSelectedDate] = useState(trip?.start_date || null);

  // Group all activities by date across stops
  const activitiesByDate = {};
  const cityByDate = {};

  if (stops && Array.isArray(stops)) {
    stops.forEach(stop => {
      // Map dates of this stop
      const s = new Date(stop.arrival_date);
      const e = new Date(stop.departure_date);
      const curr = new Date(s);
      while (curr <= e) {
        const dStr = curr.toISOString().split('T')[0];
        cityByDate[dStr] = { cityName: stop.city_name, country: stop.country, stopId: stop.id };
        curr.setDate(curr.getDate() + 1);
      }

      // Map activities
      if (stop.activities) {
        stop.activities.forEach(act => {
          if (!activitiesByDate[act.date]) {
            activitiesByDate[act.date] = [];
          }
          activitiesByDate[act.date].push({ ...act, cityName: stop.city_name });
        });
      }
    });
  }

  // Generate list of all trip dates
  const tripDates = [];
  if (trip?.start_date && trip?.end_date) {
    const s = new Date(trip.start_date);
    const e = new Date(trip.end_date);
    const curr = new Date(s);
    let dayNum = 1;
    while (curr <= e) {
      const dStr = curr.toISOString().split('T')[0];
      tripDates.push({
        dayNumber: dayNum,
        date: dStr,
        city: cityByDate[dStr] || null,
        activities: activitiesByDate[dStr] || []
      });
      curr.setDate(curr.getDate() + 1);
      dayNum++;
    }
  }

  const activeDayData = tripDates.find(d => d.date === selectedDate) || tripDates[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Calendar Strip Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-sm sm:text-base">Trip Itinerary Calendar ({tripDates.length} Days)</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Click any day to inspect details</span>
      </div>

      {/* Date Carousel Strip */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 overflow-x-auto flex space-x-3 pb-4">
        {tripDates.map((item) => {
          const isSelected = item.date === (selectedDate || tripDates[0]?.date);
          const actCount = item.activities.length;

          return (
            <button
              key={item.date}
              onClick={() => setSelectedDate(item.date)}
              className={`flex-shrink-0 w-28 p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>Day {item.dayNumber}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {actCount}
                </span>
              </div>
              <p className={`text-xs font-semibold mt-1 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                {item.date.slice(5)}
              </p>
              <p className={`text-[11px] truncate font-medium mt-1 ${isSelected ? 'text-emerald-200' : 'text-emerald-700'}`}>
                {item.city?.cityName || 'In Transit'}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Day View */}
      <div className="p-6">
        {activeDayData ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 mb-6 gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Day {activeDayData.dayNumber} Plan
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-0.5">
                  {activeDayData.date} • {activeDayData.city?.cityName ? `${activeDayData.city.cityName}, ${activeDayData.city.country}` : 'Transit Day'}
                </h4>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700">
                {activeDayData.activities.length} {activeDayData.activities.length === 1 ? 'Activity' : 'Activities'} Scheduled
              </span>
            </div>

            {activeDayData.activities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDayData.activities.map((act, i) => (
                  <div
                    key={act.id || i}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                          {act.time_slot || 'Anytime'}
                        </span>
                        <span className="font-bold text-slate-800">
                          {act.estimated_cost === 0 ? 'Free' : formatPrice(act.estimated_cost)}
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-slate-900">{act.custom_title || act.name}</h5>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{act.custom_description || act.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {act.duration_hours || 2} hours
                      </span>
                      <span className="capitalize font-semibold text-slate-600">{act.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-sm">
                No activities planned for this day yet. You can add things to do via the Itinerary Builder or Activity Catalog!
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-400">Select a date above to view schedule</div>
        )}
      </div>
    </div>
  );
}
