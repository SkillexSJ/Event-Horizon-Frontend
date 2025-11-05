import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { Loader2, AlertTriangle } from "lucide-react";

interface RouteProps {
  children: ReactNode;
}

// PrivateRoute component - protects routes that require authentication
export const PrivateRoute = ({ children }: RouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-brand-accent mx-auto mb-4 animate-spin" />
          <p className="text-brand-text-dim">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// HostRoute component - protects routes that require host privileges
export const HostRoute = ({ children }: RouteProps) => {
  const { isAuthenticated, isHost, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-brand-accent mx-auto mb-4 animate-spin" />
          <p className="text-brand-text-dim">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Redirect to discover if authenticated but not a host
  if (!isHost) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg px-4">
        <div className="max-w-md w-full bg-brand-surface rounded-2xl p-8 border border-white/10 shadow-xl text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-brand-text mb-2">
            Access Denied
          </h2>
          <p className="text-brand-text-dim mb-6">
            This page is only accessible to event hosts. Please register as a
            host to access this feature.
          </p>
          <button
            onClick={() => (window.location.href = "/discover")}
            className="bg-brand-accent text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-brand-accent-dark transition-all duration-300"
          >
            Go to Discover
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// PublicRoute component - redirects to home if already authenticated
export const PublicRoute = ({ children }: RouteProps) => {
  const { isAuthenticated, isHost, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-brand-accent mx-auto mb-4 animate-spin" />
          <p className="text-brand-text-dim">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated) {
    return <Navigate to={isHost ? "/admin/dashboard" : "/home"} replace />;
  }

  return <>{children}</>;
};
