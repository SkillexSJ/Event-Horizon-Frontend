import { useEffect, useState } from "react";
import {
  useGetUserBookings,
  useCancelBooking,
  type Booking,
} from "../../api/useBooking.ts";
import { Link } from "react-router";
import {
  X,
  Ticket,
  Calendar,
  AlertTriangle,
  User,
  TicketCheckIcon,
} from "lucide-react";
import BookingRow from "./BookingRow.tsx";
import toast from "react-hot-toast";
import { toastOptions } from "../../utils/constant.ts";

interface TicketModalProps {
  booking: Booking | null;
  onClose: () => void;
}

interface CancelModalProps {
  booking: Booking | null;
  onClose: () => void;
  onConfirm: () => void;
  isCancelling: boolean;
}

//! Modal Component for viewing the ticket
const TicketModal = ({ booking, onClose }: TicketModalProps) => {
  if (!booking) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-brand-surface rounded-2xl border border-white/10 shadow-2xl w-full max-w-2xl relative transition-all duration-300 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-text-dim hover:text-brand-text transition-colors z-10 bg-white/10 rounded-lg p-2 hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent/20 rounded-full mb-4">
              <Ticket className="w-8 h-8 text-brand-accent" />
            </div>
            <h2 className="text-3xl font-bold text-gradient mb-2">
              Your Ticket
            </h2>
            <p className="text-brand-text-dim">
              Present this at the event entrance
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <h3 className="text-2xl font-bold text-brand-text mb-4">
              Event ID: {booking.event_id.slice(0, 8)}
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-brand-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-brand-text-dim text-sm">Booking ID</p>
                  <p className="text-brand-text font-semibold">{booking.id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-brand-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-brand-text-dim text-sm">User ID</p>
                  <p className="text-brand-text font-semibold text-xs truncate">
                    {booking.user_id}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TicketCheckIcon className="w-5 h-5 text-brand-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-brand-text-dim text-sm">Transaction ID</p>
                  <p className="text-brand-text font-semibold text-xs truncate">
                    {booking.transaction_id || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-brand-text-dim text-sm mb-1">Ticket Type</p>
              <p className="text-brand-text font-bold text-lg">
                {booking.ticket_type}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-brand-text-dim text-sm mb-1">Quantity</p>
              <p className="text-brand-text font-bold text-lg">
                {booking.quantity}
              </p>
            </div>
          </div>

          <div className="bg-brand-accent/10 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-brand-text-dim">Total Paid</span>
              <span className="text-3xl font-bold text-brand-accent">
                <span className="text-4xl">৳</span>
                {booking.total_paid?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-brand-text-dim">Status</span>
              <span
                className={`px-3 py-1 rounded-full font-semibold ${
                  booking.status === "confirmed"
                    ? "bg-green-500/20 text-green-400"
                    : booking.status === "cancelled"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {booking.status
                  ? booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)
                  : "Pending"}
              </span>
            </div>
          </div>

          {/* {booking.transaction_id && (
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-brand-text-dim text-sm mb-1">Transaction ID</p>
              <p className="text-brand-text font-mono text-sm break-all">
                {booking.transaction_id}
              </p>
            </div>
          )} */}
          <button
            onClick={onClose}
            className="w-full bg-brand-accent text-white py-3 rounded-lg font-semibold hover:bg-brand-accent-dark transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

//! Cancel Confirmation Modal
const CancelModal = ({
  booking,
  onClose,
  onConfirm,
  isCancelling,
}: CancelModalProps) => {
  if (!booking) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-brand-surface rounded-2xl border border-white/10 shadow-2xl w-full max-w-md p-6 sm:p-8"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-brand-text mb-2">
            Cancel Booking?
          </h2>
          <p className="text-brand-text-dim mb-4">
            Are you sure you want to cancel and delete this booking? This will
            restore the tickets to the event.
          </p>
          <p className="text-sm text-red-400">This action cannot be undone.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="flex-1 bg-white/10 text-brand-text py-3 rounded-lg font-semibold hover:bg-white/20 transition disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {isCancelling ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MyBookingsPage() {
  const { data: bookings, isLoading, isError, error } = useGetUserBookings();

  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  //! View Ticket Handler
  const handleViewTicket = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowTicketModal(true);
  };

  //! Cancel Booking Handler
  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  //! Cancel Confirmation Handler
  const handleConfirmCancel = () => {
    if (!selectedBooking?.id) return;

    cancelBooking(selectedBooking.id, {
      onSuccess: () => {
        setShowCancelModal(false);
        setSelectedBooking(null);
        toast.success("Booking cancelled successfully", toastOptions);
      },
      onError: (error: Error) => {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to cancel booking";
        alert(`Error: ${errorMessage}`);
      },
    });
  };

  //? Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  //! Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-20">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-brand-accent mb-4"></div>
        <p className="text-brand-text-dim text-lg">Loading your bookings...</p>
      </div>
    );
  }
  //! Error Handling
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-20">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-red-500 text-xl mb-4">Failed to load bookings</p>
        <p className="text-brand-text-dim mb-6">
          {error?.message || "Please try again later"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-brand-accent text-white px-6 py-2 rounded-lg hover:bg-brand-accent-dark transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* //! Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-24 sm:py-32">
        <div className="max-w-5xl mx-auto ">
          <div className="text-center sm:text-left mb-10 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gradient mb-2">
              My Bookings
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-brand-text-dim">
              Manage your event tickets and view booking details
            </p>
          </div>

          {!bookings || bookings.length === 0 ? (
            <div className="bg-brand-surface rounded-2xl border border-white/10 p-8 sm:p-12 text-center shadow-lg">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-accent/20 rounded-full mb-6">
                <Ticket className="w-10 h-10 text-brand-accent" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-brand-text mb-3">
                No Bookings Yet
              </h3>
              <p className="text-brand-text-dim mb-8 max-w-md mx-auto">
                You haven't booked any events yet. Discover amazing events and
                book your tickets now!
              </p>
              <Link
                to="/discover"
                className="inline-block bg-brand-accent text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-brand-accent-dark transition duration-300 shadow-lg"
              >
                Discover Events
              </Link>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col items-center">
              {bookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  onViewTicket={handleViewTicket}
                  onCancelBooking={handleCancelClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* //! Ticket Modal */}
      {showTicketModal && (
        <TicketModal
          booking={selectedBooking}
          onClose={() => setShowTicketModal(false)}
        />
      )}

      {showCancelModal && (
        <CancelModal
          booking={selectedBooking}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
          isCancelling={isCancelling}
        />
      )}
    </>
  );
}
