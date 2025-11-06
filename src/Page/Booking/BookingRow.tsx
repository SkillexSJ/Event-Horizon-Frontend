import { Calendar, CalendarDays, CreditCard, MapPin } from "lucide-react";
import { useState } from "react";
import type { Booking } from "../../api/useBooking";
import { useGetEvent } from "../../api/useEvent";

//! INTERFACE OF BOOKING ROW PROPS
interface BookingRowProps {
  booking: Booking;
  onViewTicket: (booking: Booking) => void;
  onCancelBooking: (booking: Booking) => void;
}

const BookingRow = ({
  booking,
  onViewTicket,
  onCancelBooking,
}: BookingRowProps) => {
  const { data: event, isLoading, isError } = useGetEvent(booking.event_id);
  const [imageError, setImageError] = useState(false);

  if (isLoading || isError) return null;

  const isCancelled = booking.status === "cancelled";

  return (
    <div className="bg-brand-surface w-[400px] md:w-full rounded-2xl border border-white/10 p-4 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6 shadow-lg hover:border-brand-accent/30 transition-all duration-300">
      <div className="w-full lg:w-40 h-32 rounded-xl overflow-hidden shrink-0 bg-linear-to-br from-brand-accent to-brand-accent-dark">
        {event?.image_url && !imageError ? (
          <img
            src={event.image_url}
            alt={event.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays className="w-12 h-12 text-white/50" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <h3 className="text-xl sm:text-2xl font-bold text-brand-text">
            {event?.name || "Event"}
          </h3>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full shrink-0 ${
              isCancelled
                ? "bg-red-500/20 text-red-400"
                : booking.status === "confirmed"
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {booking.status
              ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
              : "Pending"}
          </span>
        </div>

        <div className="space-y-2 text-brand-text-dim text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-accent" />
            <span>Booking ID: {booking.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-accent" />
            <span>User ID: {booking.user_id}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-accent" />
            <span>
              {booking.quantity}x {booking.ticket_type} •{" "}
              <span className="text-xl">৳</span>
              {booking.total_paid?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">
        <button
          onClick={() => onViewTicket(booking)}
          className="bg-brand-accent text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-brand-accent-dark transition duration-300 text-sm whitespace-nowrap"
        >
          View Ticket
        </button>
        {!isCancelled && (
          <button
            onClick={() => onCancelBooking(booking)}
            className="bg-red-600/20 text-red-400 py-2.5 px-6 rounded-lg font-semibold hover:bg-red-600/40 hover:text-red-300 transition duration-300 text-sm whitespace-nowrap"
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingRow;
