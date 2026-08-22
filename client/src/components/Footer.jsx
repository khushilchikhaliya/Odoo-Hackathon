import React from 'react';
import { Compass, Heart, Globe, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">GlobeTrotter</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering personalized, intelligent, and collaborative multi-city travel planning across the globe.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Odoo Hackathon Solution</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/cities" className="hover:text-emerald-400 transition-colors">Global Cities</a></li>
              <li><a href="/activities" className="hover:text-emerald-400 transition-colors">Curated Activities</a></li>
              <li><a href="/trips/new" className="hover:text-emerald-400 transition-colors">Itinerary Builder</a></li>
              <li><a href="/trips" className="hover:text-emerald-400 transition-colors">My Itineraries</a></li>
            </ul>
          </div>

          {/* Travel Tools */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Planning Tools</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-slate-400">Automated Budget Estimator</span></li>
              <li><span className="text-slate-400">Day-by-Day Timeline Visualizer</span></li>
              <li><span className="text-slate-400">Multi-Stop Drag-and-Drop</span></li>
              <li><span className="text-slate-400">Public Itinerary Sharing</span></li>
            </ul>
          </div>

          {/* Hackathon Specs */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Powered by a relational database schema, JWT auth, Chart.js analytics, and responsive modern frontend.
            </p>
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">Ready for Pair Programming:</span><br/>
              Includes 1-click Traveler & Admin Demo credentials.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 GlobeTrotter Inc. All rights reserved.</p>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for seamless travel planning</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
