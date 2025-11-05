import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import api from "./useAxios.ts";

interface TicketInfo {
    type: "VIP" | "Regular" | "Student";
    price: number;
    total_quantity: number;
    available_quantity: number;
}

// Full Event model for GET requests (matches backend Event model)
export interface Event {
    id: string;
    host_id: string;
    category_name: string;
    name: string;
    description: string;
    date: string;
    location: string;
    image_url?: string;
    start_time: string;
    end_time: string;
    created_at: string;
    tickets: TicketInfo[];
}

// Request type for creating a new event
export interface CreateEventRequest {
    category_name: string;
    name: string;
    description: string;
    date: string; // ISO format
    location: string;
    image_url?: string; // Optional image URL from ImgBB
    start_time: string; // ISO format
    end_time: string; // ISO format
    tickets: TicketInfo[];
}

// EventResponse type for POST requests (matches backend EventResponse model)
export interface EventResponse {
    id: string;
    name: string;
    host_id: string;
    category_name: string;
    date: string;
    location: string;
    tickets: TicketInfo[];
}

// Function to create a new event
const createEvent = async (
    data: CreateEventRequest
): Promise<EventResponse> => {
    const response = await api.post<EventResponse>("/events/create", data);
    return response.data;
};

export const useGetEvent = (eventId: string) => {
    return useQuery<Event, Error>({
        queryKey: ["event", eventId],
        queryFn: async () => {
            const response = await api.get<Event>(`/events/${eventId}`);
            return response.data;
        },
        enabled: !!eventId, // only fetch if eventId exists
    });
};

// Hook to get all events - returns full Event objects with all fields
export const useGetAllEvents = () => {
    return useQuery<Event[], Error>({
        queryKey: ["events"],
        queryFn: async () => {
            const response = await api.get<Event[]>("/events/all");
            return response.data;
        },
    });
};

// Hook to create a new event
export const useCreateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createEvent,
        onSuccess: () => {
            // Invalidate and refetch events after successful creation
            queryClient.invalidateQueries({queryKey: ["events"]});
        },
    });
};

// Function to update an event
const updateEvent = async (
    eventId: string,
    data: CreateEventRequest
): Promise<EventResponse> => {
    const response = await api.put<EventResponse>(`/events/${eventId}`, data);
    return response.data;
};

// Hook to update an event
export const useUpdateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         eventId,
                         data,
                     }: {
            eventId: string;
            data: CreateEventRequest;
        }) => updateEvent(eventId, data),
        onSuccess: () => {
            // Invalidate and refetch events after successful update
            queryClient.invalidateQueries({queryKey: ["events"]});
        },
    });
};

// Function to delete an event
const deleteEvent = async (eventId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/events/${eventId}`);
    return response.data;
};

// Hook to delete an event
export const useDeleteEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteEvent,
        onSuccess: () => {
            // Invalidate and refetch events after successful deletion
            queryClient.invalidateQueries({queryKey: ["events"]});
            queryClient.invalidateQueries({queryKey: ["bookings"]});
        },
    });
};
