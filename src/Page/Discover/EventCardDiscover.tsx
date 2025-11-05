import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router";
import type { Event } from "../../api/useCategories";
import { useMemo } from "react";

const EventCardDiscover = ({ event }: { event: Event }) => {
  const eventDate = new Date(event.date);
  const isValidDate = !isNaN(eventDate.getTime());

  const day = isValidDate
    ? eventDate.getDate().toString().padStart(2, "0")
    : "00";
  const month = isValidDate
    ? eventDate.toLocaleString("default", { month: "short" })
    : "---";

  const cheapestPrice = useMemo(() => {
    if (!event.tickets || event.tickets.length === 0) return null;
    const prices = event.tickets.map((t) => t.price);
    return Math.min(...prices);
  }, [event.tickets]);

  //! Check if event is live now
  const isLiveNow = () => {
    if (!event.start_time || !event.end_time) return false;
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    return now >= startTime && now <= endTime;
  };

  return (
    <Link to={`/event/${event.id}`}>
      <div className="bg-brand-surface rounded-2xl shadow-xl overflow-hidden border border-white/10 group hover:border-brand-accent/50 transition-all duration-300 hover:scale-[1.02]">
        <div className="relative h-48 sm:h-56 md:h-64 bg-linear-to-br from-brand-accent to-brand-accent-dark overflow-hidden">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.classList.add(
                    "flex",
                    "items-center",
                    "justify-center"
                  );
                }
              }}
            />
          ) : null}

          {/* //! Fallback background pattern */}
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              event.image_url ? "-z-10" : "z-0"
            }`}
          >
            <div className="w-full h-full bg-linear-to-br from-brand-accent/80 to-brand-accent-dark/80 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Calendar />
                </div>
                <p className="text-white/60 text-xs sm:text-sm font-semibold">
                  Event Image
                </p>
              </div>
            </div>
          </div>

          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-brand-surface/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center leading-none shadow-lg z-10">
            <span className="text-xl sm:text-2xl font-bold text-brand-text block">
              {day}
            </span>
            <span className="text-xs font-semibold text-brand-accent uppercase block mt-0.5">
              {month}
            </span>
          </div>

          <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-brand-accent/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full z-10">
            {event.category_name}
          </span>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-brand-text mb-3 line-clamp-2 group-hover:text-gradient transition-colors duration-300">
            {event.name}
          </h3>
          {/* Live Now Badge */}
          {isLiveNow() && (
            <p className="text-red-500 text-xl animate-pulse">LIVE</p>
          )}

          <p className="text-brand-text-dim text-sm mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="flex items-center text-brand-text-dim mb-4">
            <MapPin />
            <span className="text-sm truncate">{event.location}</span>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div>
              {cheapestPrice !== null ? (
                <div>
                  <span className="text-xs text-brand-text-dim">From</span>
                  <span className="text-xl font-bold text-brand-accent ml-2">
                    {cheapestPrice.toFixed(2)}
                    <span className="text-3xl font-bold text-brand-accent">
                      ৳
                    </span>
                  </span>
                </div>
              ) : (
                <span className="text-brand-text-dim">Price TBA</span>
              )}
            </div>
            <div className="text-brand-accent flex items-center justify-center font-semibold group-hover:translate-x-1 transition-transform">
              <h1>View Details</h1>
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCardDiscover;
