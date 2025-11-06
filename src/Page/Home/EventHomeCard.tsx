import { Calendar, MapPin } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

interface HomeEvent {
  id: string;
  category_name: string;
  name: string;
  date: string;
  location: string;
  image_url?: string;
  created_at?: string;
  start_time?: string;
  end_time?: string;
}

const EventCardSimple = ({ event }: { event: HomeEvent }) => {
  const [imageError, setImageError] = useState(false);

  //! Parse ISO date
  const eventDate = new Date(event.date);

  //! Check date
  const isValidDate = !isNaN(eventDate.getTime());

  const day = isValidDate
    ? eventDate.getDate().toString().padStart(2, "0")
    : "00";
  const month = isValidDate
    ? eventDate.toLocaleString("default", { month: "short" })
    : "---";
  const year = isValidDate ? eventDate.getFullYear() : "----";

  //! Check if event is live now
  const isLiveNow = () => {
    if (!event.start_time || !event.end_time) return false;
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    return now >= startTime && now <= endTime;
  };

  return (
    <div className="bg-brand-surface rounded-2xl shadow-xl overflow-hidden border border-white/10 group hover:border-brand-accent/50 transition-all duration-300 flex flex-col h-full">
      {/* //!Image Section */}
      <div className="relative h-48 overflow-hidden shrink-0">
        {/* //!Background Gradient (Fallback) */}
        <div className="absolute inset-0 bg-fuchsia-950 to-red-400">
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-16 h-16 text-black" />
          </div>
        </div>

        {/* //!Event Image */}
        {event.image_url && !imageError && (
          <img
            src={event.image_url}
            alt={event.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}

        {/* //!Category Badge & Date Overlay */}
        <div className="absolute inset-0 z-10 p-4 flex flex-col justify-between">
          {/* Top Row - Category Badge and Live Badge */}
          <div className="flex justify-between items-start">
            <span className="bg-white backdrop-blur-sm text-brand-accent-dark text-xs font-bold px-3 py-1.5 rounded-full">
              {event.category_name}
            </span>

            {/* Live Now Badge */}
            {isLiveNow() && (
              <div className="flex items-center gap-1.5 bg-red-500/95 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                LIVE NOW
              </div>
            )}
          </div>

          {/* Date Display */}
          <div className="flex justify-end">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-right">
              <div className="text-2xl font-bold text-gray-800 leading-none">
                {day}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">
                {month} {year}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Info */}
      <div className="p-6 flex flex-col grow">
        <div className="grow">
          <h3 className="text-2xl font-semibold text-brand-text mb-4 line-clamp-2 group-hover:text-gradient transition-colors duration-300">
            {event.name}
          </h3>

          {/* Location */}
          <div className="flex items-center text-brand-text-dim mb-6">
            <MapPin className="w-5 h-5 mr-2 shrink-0" />
            <span className="text-sm truncate">{event.location}</span>
          </div>
        </div>

        {/* View Details Button - Fixed at bottom */}
        <Link
          to={`/event/${event.id}`}
          className="inline-block w-full text-center bg-brand-accent text-white py-3 px-6 rounded-full font-semibold hover:bg-brand-accent-dark transition-all duration-300 shadow-lg hover:shadow-custom-glow hover:scale-105"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCardSimple;
