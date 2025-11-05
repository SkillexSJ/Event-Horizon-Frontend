import { Link } from "react-router";

const EventCard = ({ event }: { event: any }) => {
  // Parse ISO date string
  const eventDate = new Date(event.date); // event.date = "2025-10-31T00:00:00.000+00:00"
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString("default", { month: "short" }); // e.g., "Oct"

  return (
    <div className="bg-brand-surface rounded-2xl shadow-xl overflow-hidden border border-white/10 group">
      {/* Event Image */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-linear-to-br from-brand-accent to-brand-accent-dark">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title || event.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.classList.add("flex", "items-center", "justify-center");
              }
            }}
          />
        ) : null}

        {/* Fallback background pattern - always rendered behind image */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            event.image_url ? "-z-10" : "z-0"
          }`}
        >
          <div className="w-full h-full bg-linear-to-br from-brand-accent/80 to-brand-accent-dark/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white/70"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </div>
              <p className="text-white/60 text-xs sm:text-sm font-semibold">
                Event Image
              </p>
            </div>
          </div>
        </div>

        {/* Date Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 glass-effect rounded-lg p-2 sm:p-3 text-center leading-none z-10">
          <span className="text-xl sm:text-2xl font-bold text-white block">
            {day}
          </span>
          <span className="text-xs font-semibold text-brand-accent-light uppercase block mt-0.5">
            {month}
          </span>
        </div>

        {/* Category Badge */}
        {event.category && (
          <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-brand-accent/80 text-white text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full z-10">
            {event.category}
          </span>
        )}
      </div>

      {/* Event Info */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-brand-text-dim">
            {event.location}
          </span>
          <span className="text-lg font-bold text-brand-text">
            {event.price}
          </span>
        </div>
        <h3 className="text-2xl font-semibold text-brand-text mb-5 truncate group-hover:text-gradient">
          {event.title}
        </h3>
        <Link
          to={`/event/${event.id}`}
          className="inline-block w-full text-center bg-brand-accent text-white py-3 px-6 rounded-full font-semibold group-hover:bg-brand-accent-dark transition duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
