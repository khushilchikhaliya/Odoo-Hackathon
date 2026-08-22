import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, MessageCircle, Twitter } from 'lucide-react';

export default function ShareModal({ trip, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !trip) return null;

  const shareUrl = `${window.location.origin}/share/${trip.share_token || trip.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Check out my customized travel itinerary "${trip.title}" on GlobeTrotter! 🌍✈️`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out my trip plan "${trip.title}": ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Share Itinerary</h3>
              <p className="text-xs text-slate-500">Anyone with this link can view your trip</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trip Preview Banner */}
        <div className="my-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-3">
          <img
            src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'}
            alt={trip.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-slate-900 truncate">{trip.title}</h4>
            <p className="text-xs text-slate-500">{trip.start_date} → {trip.end_date}</p>
          </div>
        </div>

        {/* Share Link Copy Box */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Public Link</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-600 mb-3 text-center">Or share directly on</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleTwitterShare}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <Twitter className="w-4 h-4 text-sky-500 fill-sky-500" />
              <span>Share on X</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500 fill-emerald-100" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
