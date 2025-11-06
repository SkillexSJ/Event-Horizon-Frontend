import { useParams, useNavigate } from "react-router";
import { useGetEvent } from "../api/useEvent.ts";
import { useCreateBooking } from "../api/useBooking.ts";
import { useState, useMemo, useEffect } from "react";
import EventImageFallback from "../Components/EventImageFallback.tsx";
import { FileWarning } from "lucide-react";
import toast from "react-hot-toast";
import { errorToastOptions, toastOptions } from "../utils/constant.ts";

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading, isError } = useGetEvent(id!);
  const { mutate: createBooking, isPending: isBooking } = useCreateBooking();

  const [selectedTicketType, setSelectedTicketType] = useState<
    "VIP" | "Regular" | "Student" | null
  >(null);
  const [quantity, setQuantity] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Scroll to top when component mounts or when event ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Check if we should show image or fallback
  const hasValidImage =
    event?.image_url && event.image_url.trim() !== "" && !imageError;

  // Calculate total price
  const selectedTicket = useMemo(() => {
    if (!event || !selectedTicketType) return null;
    return event.tickets.find((t) => t.type === selectedTicketType);
  }, [event, selectedTicketType]);

  const totalPrice = useMemo(() => {
    if (!selectedTicket) return 0;
    return selectedTicket.price * quantity;
  }, [selectedTicket, quantity]);

  const handleBooking = () => {
    if (!selectedTicketType || !id) return;

    createBooking(
      {
        event_id: id,
        ticket_type: selectedTicketType,
        quantity: quantity,
      },
      {
        onSuccess: () => {
          setShowBookingModal(false);
          toast.success("Booking successful!", toastOptions);
          navigate("/my-bookings");
        },
        onError: (error: Error) => {
          const errorMessage =
            error instanceof Error ? error.message : "Booking failed";
          toast.error(`Booking failed: ${errorMessage}`, errorToastOptions);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-20">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-brand-accent mb-4"></div>
        <p className="text-brand-text-dim text-lg">Loading event details...</p>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-20">
        <FileWarning className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-red-500 text-xl mb-4">Failed to load event</p>
        <button
          onClick={() => navigate("/discover")}
          className="bg-brand-accent text-white px-6 py-2 rounded-lg hover:bg-brand-accent-dark transition"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);
  const isValidDate = !isNaN(eventDate.getTime());

  const day = isValidDate ? eventDate.getDate() : 0;
  const month = isValidDate
    ? eventDate.toLocaleString("default", { month: "long" })
    : "Unknown";
  const weekday = isValidDate
    ? eventDate.toLocaleString("default", { weekday: "long" })
    : "Unknown";
  const year = isValidDate ? eventDate.getFullYear() : 0;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const timeRange = `${formatTime(startTime)} - ${formatTime(endTime)}`;

  //! Check if event is live now
  const isLiveNow = () => {
    const now = new Date();
    return now >= startTime && now <= endTime;
  };

  return (
    <main className="overflow-x-hidden pt-20 pb-28 bg-brand-bg text-brand-text">
      {/* Hero Section with Image */}
      <section className="relative w-full max-w-7xl mx-auto mb-12 px-4">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          {/* Conditionally render: Image OR Fallback */}
          {hasValidImage ? (
            <img
              src={event.image_url}
              alt={event.name}
              loading="eager"
              className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] object-cover"
              onError={() => {
                setImageError(true);
              }}
            />
          ) : (
            <EventImageFallback />
          )}

          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent z-20" />

          {/* Live Now Badge - Top Right */}
          {isLiveNow() && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-2 bg-red-500/95 backdrop-blur-sm text-white text-sm sm:text-base font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-full animate-pulse shadow-lg">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              LIVE NOW
            </div>
          )}

          <div className="absolute bottom-6 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 z-20">
            <span className="inline-block bg-brand-accent/90 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-3 sm:mb-4">
              {event.category_name}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold text-white drop-shadow-2xl mb-2 sm:mb-3">
              {event.name}
            </h1>
            <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm md:text-base">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {weekday}, {month} {day}, {year}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Details & Booking Section */}
      <section className="container mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Event Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Event */}
          <div className="bg-brand-surface/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-brand-accent"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
              About This Event
            </h2>
            <p className="text-brand-text-dim leading-relaxed text-base sm:text-lg whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Date and Time */}
          <div className="bg-brand-surface/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-brand-accent"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Date and Time
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-brand-accent/20 rounded-xl p-4 text-center min-w-20">
                  <span className="block text-3xl font-bold text-brand-accent">
                    {day}
                  </span>
                  <span className="block text-sm text-brand-text-dim uppercase tracking-wider">
                    {month.substring(0, 3)}
                  </span>
                </div>
                <div>
                  <p className="text-brand-text font-semibold text-lg">
                    {weekday}, {month} {day}, {year}
                  </p>
                  <p className="text-brand-text-dim">{timeRange}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-brand-surface/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-brand-accent"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              Event Location
            </h2>
            <div className="flex items-start gap-4">
              <div className="bg-brand-accent/20 rounded-xl p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-6 h-6 text-brand-accent"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-brand-text font-semibold text-lg mb-1">
                  {event.location}
                </p>
                <p className="text-brand-text-dim text-sm">
                  View on map for directions and nearby parking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Ticket Booking Card in the mobile menu it will be at first */}
        <div className="lg:col-span-1 order-first">
          <div className="bg-brand-surface/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 sticky top-24">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Select Tickets
            </h2>

            {/* Ticket Options */}
            <div className="space-y-4 mb-6">
              {event.tickets.map((ticket) => (
                <div
                  key={ticket.type}
                  onClick={() => {
                    if (ticket.available_quantity > 0) {
                      setSelectedTicketType(ticket.type);
                      setQuantity(1);
                    }
                  }}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                    selectedTicketType === ticket.type
                      ? "border-brand-accent bg-brand-accent/10 shadow-lg"
                      : "border-white/10 hover:border-brand-accent/50 bg-white/5"
                  } ${
                    ticket.available_quantity === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-brand-text">
                        {ticket.type}
                      </h3>
                      <p className="text-brand-text-dim text-sm">
                        {ticket.available_quantity > 0
                          ? `${ticket.available_quantity} of ${ticket.total_quantity} available`
                          : "Sold Out"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand-accent">
                        {ticket.price.toFixed(2)}
                        <span className="font-bold text-3xl text-brand-accent">
                          ৳
                        </span>
                      </p>
                    </div>
                  </div>
                  {selectedTicketType === ticket.type && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <label className="block text-sm font-semibold text-brand-text-dim mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuantity((prev) => Math.max(1, prev - 1));
                          }}
                          className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition"
                          disabled={quantity <= 1}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (
                              !isNaN(val) &&
                              val >= 1 &&
                              val <= ticket.available_quantity
                            ) {
                              setQuantity(val);
                            }
                          }}
                          min={1}
                          max={ticket.available_quantity}
                          className="w-16 text-center bg-white/5 border border-white/10 rounded-lg py-2 text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuantity((prev) =>
                              Math.min(ticket.available_quantity, prev + 1)
                            );
                          }}
                          className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition"
                          disabled={quantity >= ticket.available_quantity}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total Price */}
            {selectedTicketType && (
              <div className="bg-brand-accent/10 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-brand-text-dim">Total</span>
                  <span className="text-3xl font-bold text-brand-accent">
                    {totalPrice.toFixed(2)}
                    <span text-3xl font-bold text-brand-accent>
                      ৳
                    </span>
                  </span>
                </div>
                <p className="text-sm text-brand-text-dim mt-2">
                  {quantity} x {selectedTicketType} ticket
                  {quantity > 1 ? "s" : ""}
                </p>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={() => setShowBookingModal(true)}
              disabled={!selectedTicketType || isBooking}
              className="w-full bg-brand-accent text-white py-4 px-6 rounded-xl font-semibold hover:bg-brand-accent-dark transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isBooking ? "Processing..." : "Book Now"}
            </button>

            <p className="text-xs text-brand-text-dim text-center mt-4">
              * Booking confirmation will be sent to your email
            </p>
          </div>
        </div>
      </section>

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold mb-4 text-brand-text">
              Confirm Booking
            </h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-brand-text-dim">
                <span>Event:</span>
                <span className="text-brand-text font-semibold">
                  {event.name}
                </span>
              </div>
              <div className="flex justify-between text-brand-text-dim">
                <span>Ticket Type:</span>
                <span className="text-brand-text font-semibold">
                  {selectedTicketType}
                </span>
              </div>
              <div className="flex justify-between text-brand-text-dim">
                <span>Quantity:</span>
                <span className="text-brand-text font-semibold">
                  {quantity}
                </span>
              </div>
              <div className="flex justify-between text-brand-text-dim pt-3 border-t border-white/10">
                <span className="text-lg">Total:</span>
                <span className="text-2xl font-bold text-brand-accent">
                  <span className="text-4xl">৳</span>
                  {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                disabled={isBooking}
                className="flex-1 bg-white/10 text-brand-text py-3 px-6 rounded-lg font-semibold hover:bg-white/20 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                disabled={isBooking}
                className="flex-1 bg-brand-accent text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-accent-dark transition disabled:opacity-50"
              >
                {isBooking ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default EventDetailsPage;
