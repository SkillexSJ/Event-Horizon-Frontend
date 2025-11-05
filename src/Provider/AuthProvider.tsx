import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

//! User interface
export interface User {
  id: string;
  name: string;
  email: string;
  is_host: boolean;
}

//! Auth context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHost: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

//! Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//! AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  //! Initialize  from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;

          //! Validate token
          const payload = JSON.parse(atob(storedToken.split(".")[1]));
          const expiryTime = payload.exp * 1000;

          if (Date.now() >= expiryTime) {
            //! Token expired
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setToken(null);
          } else {
            setToken(storedToken);
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        //! Clear
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // !Login function
  const login = (newToken: string, newUser: User) => {
    try {
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      console.error("Failed to save auth data:", error);
    }
  };

  //! Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  //! Update user function (for profile updates)
  const updateUser = (updatedUser: User) => {
    try {
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update user data:", error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isHost: user?.is_host || false,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
