import { Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../Provider/AuthProvider";
import { Menu, X, Sparkles, DoorOpenIcon } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use AuthProvider instead of manual localStorage reads
  const { user, isAuthenticated, isHost, logout } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  // Helper function to check if link is active
  const isActive = (path: string) => {
    if (path === "/home" && location.pathname === "/home") return true;
    if (path !== "/home" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Navigation links for authenticated users
  const navLinks = [
    { path: "/home", label: "Home", icon: "home", public: true },
    { path: "/discover", label: "Discover", icon: "search", public: true },
    {
      path: "/my-bookings",
      label: "My Bookings",
      icon: "ticket",
      public: false,
    },
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: "dashboard",
      public: false,
      hostOnly: true,
    },
    {
      path: "/admin/add-event",
      label: "Create Event",
      icon: "plus",
      public: false,
      hostOnly: true,
    },
  ];

  // Filter links based on auth status and host status
  const visibleLinks = navLinks.filter((link) => {
    if (link.public) return true;
    if (!isAuthenticated) return false;
    if (link.hostOnly && !isHost) return false;
    return true;
  });

  return (
    <header className="w-full top-0 z-50 glass-effect fixed border-b border-white/10">
      <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/home"
            className="text-2xl font-bold text-brand-text flex items-center hover:opacity-80 transition-opacity"
          >
            <Sparkles className="mr-2 w-6 h-6 text-brand-accent" />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-brand-accent to-brand-accent-light">
              Event Horizon
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 font-semibold rounded-lg  transition-all duration-300 ${
                  isActive(link.path)
                    ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/20"
                    : "text-brand-text hover:text-brand-text hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-brand-accent to-brand-accent-dark flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() ||
                      (isHost ? "H" : "U")}
                  </div>
                  <span className="text-sm text-brand-text font-semibold">
                    {user?.name || (isHost ? "Host" : "User")}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-lg font-semibold text-brand-text-dim hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className={`px-5 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isActive("/auth/login")
                      ? "bg-white/10 text-brand-text border border-white/20"
                      : "text-brand-text hover:text-brand-text hover:bg-white/5"
                  }`}
                >
                  Log In
                </Link>
                <Link
                  to="/auth/signup"
                  className="bg-brand-accent text-white px-5 py-2 rounded-lg font-semibold hover:bg-brand-accent-dark transition-all duration-300 shadow-custom-glow"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden  text-brand-text p-2 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4 animate-fadeIn">
            {/* Mobile Navigation Links */}
            <div className="space-y-1 mb-4">
              {visibleLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isActive(link.path)
                      ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/20"
                      : "text-brand-text hover:text-brand-text hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/5 rounded-lg border border-white/10 mb-2">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-brand-accent to-brand-accent-dark flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase() ||
                        (isHost ? "H" : "U")}
                    </div>
                    <div>
                      <p className="text-brand-text font-semibold text-sm">
                        {user?.name || "User"}
                      </p>
                      <p className="text-brand-text-dim text-xs">
                        {isHost ? "Event Host" : "Attendee"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-lg font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className={`block px-4 py-3 rounded-lg font-semibold text-center transition-all duration-300 ${
                      isActive("/auth/login")
                        ? "bg-white/10 text-brand-text border border-white/20"
                        : "text-brand-text hover:text-brand-text hover:bg-white/5 border border-white/10"
                    }`}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="block bg-brand-accent text-white px-4 py-3 rounded-lg font-semibold text-center hover:bg-brand-accent-dark transition-all duration-300 shadow-custom-glow"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
