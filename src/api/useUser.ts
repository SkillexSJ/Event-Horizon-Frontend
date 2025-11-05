import { useMutation } from "@tanstack/react-query";
import api from "./useAxios.ts";

// User model matching backend
export interface User {
  id: string;
  name: string;
  email: string;
  is_host: boolean;
  created_at: string;
}

// Signup request type
type SignupData = {
  name: string;
  email: string;
  password: string;
  is_host?: boolean;
};

// Login request type
type LoginData = {
  email: string;
  password: string;
};

// Auth response type
interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Signup mutation
export const useSignup = () => {
  return useMutation<AuthResponse, Error, SignupData>({
    mutationFn: async (data) => {
      const response = await api.post<AuthResponse>("/users/register", data);
      return response.data;
    },
  });
};

// Login mutation
export const useLogin = () => {
  return useMutation<AuthResponse, Error, LoginData>({
    mutationFn: async (data) => {
      const response = await api.post<AuthResponse>("/users/login", data);
      return response.data;
    },
  });
};
