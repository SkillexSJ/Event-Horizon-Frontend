import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./useAxios";

// Category type based on backend model
export interface Category {
  id: string;
  name: string;
  created_at: string;
}

// Ticket info interface
interface TicketInfo {
  type: "VIP" | "Regular" | "Student";
  price: number;
  total_quantity: number;
  available_quantity: number;
}

// Event interface
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

// CategoryWithEvents interface
export interface CategoryWithEvents {
  category: Category;
  events: Event[];
  event_count: number;
}

// Request type for creating a new category
interface CreateCategoryRequest {
  name: string;
}

// Fetch function to get all categories
const fetchCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>("/categories");
  return response.data;
};

// Fetch all categories with their events
const fetchCategoriesWithEvents = async (): Promise<CategoryWithEvents[]> => {
  const response = await api.get<CategoryWithEvents[]>(
    "/categories/with-events"
  );
  return response.data;
};

// Fetch events by category name
const fetchEventsByCategoryName = async (
  categoryName: string
): Promise<CategoryWithEvents> => {
  const response = await api.get<CategoryWithEvents>(
    `/categories/name/${encodeURIComponent(categoryName)}/events`
  );
  return response.data;
};

// Function to create a new category
const createCategory = async (
  data: CreateCategoryRequest
): Promise<Category> => {
  const response = await api.post<Category>("/categories/create", data);
  return response.data;
};

// Function to delete a category
const deleteCategory = async (categoryId: string): Promise<void> => {
  await api.delete(`/categories/${categoryId}`);
};

// hook to fetch categories
export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook to get all categories with their events
export const useGetCategoriesWithEvents = () => {
  return useQuery<CategoryWithEvents[], Error>({
    queryKey: ["categories-with-events"],
    queryFn: fetchCategoriesWithEvents,
    staleTime: 1000 * 60 * 5,
  });
};

// Hook to get events by category name
export const useGetEventsByCategoryName = (categoryName: string) => {
  return useQuery<CategoryWithEvents, Error>({
    queryKey: ["category-events", categoryName],
    queryFn: () => fetchEventsByCategoryName(categoryName),
    enabled: !!categoryName && categoryName !== "All Events", // Only fetch if category is selected
    staleTime: 1000 * 60 * 5,
  });
};

// hook to create a new category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      //! Invalidate and refetch categories after successful creation
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// hook to delete a category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      //! Invalidate and refetch categories after successful deletion
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-with-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
