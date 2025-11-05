import {useQuery} from "@tanstack/react-query";
import api from "./useAxios.ts";

const useGetEvents = () => {
    // Implementation for fetching events goes here

    return useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const response = await api.get("/events/all")
            const data = response.data;

            // safely handle different API response shapes
            if (Array.isArray(data)) return data;
            if (Array.isArray(data.events)) return data.events;
            if (Array.isArray(data.data)) return data.data;

            console.warn("Unexpected response shape:", data);
            return [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}


export default useGetEvents;