import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./useAxios.ts";
import type { Event } from "./useEvent.ts";

// Booking interface matching backend model
export interface Booking {
  id?: string;
  user_id?: string;
  event_id: string;
  ticket_type: "VIP" | "Regular" | "Student";
  transaction_id?: string;
  quantity: number;
  total_paid?: number;
  status?: string;
  booked_at?: string;
}

// BookingWithDetails interface for responses with populated data
export interface BookingWithDetails {
  booking: Booking;
  event?: Event;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Request type for creating a booking
export interface CreateBookingRequest {
  event_id: string;
  ticket_type: "VIP" | "Regular" | "Student";
  quantity: number;
}

// Response type for getUserBookings
interface GetUserBookingsResponse {
  bookings: Booking[];
  count: number;
}

// Response type for getBookingByID
interface GetBookingByIDResponse {
  booking: Booking;
}

// Function to create a new booking
const createBooking = async (data: CreateBookingRequest): Promise<Booking> => {
  const response = await api.post<Booking>("/bookings/create", data);
  return response.data;
};

// Function to get user's bookings
const getUserBookings = async (): Promise<Booking[]> => {
  const response = await api.get<GetUserBookingsResponse>("/bookings/user");
  return response.data.bookings; // Extract the bookings array from the response
};

// Function to get all bookings (admin function)
const getAllBookings = async (): Promise<Booking[]> => {
  const response = await api.get<GetUserBookingsResponse>("/bookings/all");
  return response.data.bookings; // Extract the bookings array from the response
};

// Function to get a specific booking by ID
const getBookingByID = async (bookingId: string): Promise<Booking> => {
  const response = await api.get<GetBookingByIDResponse>(
    `/bookings/${bookingId}`
  );
  return response.data.booking; // Extract the booking object from the response
};

// Function to cancel a booking
const cancelBooking = async (bookingId: string): Promise<Booking> => {
  const response = await api.put<Booking>(`/bookings/${bookingId}/cancel`);
  return response.data;
};

// Hook to create a new booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      // Invalidate and refetch bookings and events after successful booking
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// Hook to get user's bookings
export const useGetUserBookings = () => {
  return useQuery<Booking[], Error>({
    queryKey: ["bookings", "user"],
    queryFn: getUserBookings,
  });
};

// Hook to get all bookings (admin function)
export const useGetAllBookings = () => {
  return useQuery<Booking[], Error>({
    queryKey: ["bookings", "all"],
    queryFn: getAllBookings,
  });
};

// Hook to get a specific booking by ID
export const useGetBookingByID = (bookingId: string) => {
  return useQuery<Booking, Error>({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingByID(bookingId),
    enabled: !!bookingId,
  });
};

// Hook to cancel a booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      // Invalidate and refetch bookings and events after cancellation
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
