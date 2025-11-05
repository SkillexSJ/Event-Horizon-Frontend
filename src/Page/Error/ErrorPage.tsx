import { useNavigate } from "react-router";
import { Home, Search, ArrowLeft, Sparkles } from "lucide-react";

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/home");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDiscover = () => {
    navigate("/discover");
  };

  return (
    <main className="relative min-h-screen w-full bg-brand-bg overflow-hidden flex items-center justify-center">
      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl px-6 lg:px-8 text-center">
        {/* 404 Text */}
        <div className="mb-6">
          <h1 className="text-8xl sm:text-9xl font-extrabold text-white mb-2 tracking-tight">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-12 bg-linear-to-r from-transparent via-brand-accent to-transparent"></div>
            <span className="text-brand-accent text-sm font-semibold uppercase tracking-widest">
              Page Not Found
            </span>
            <div className="h-px w-12 bg-linear-to-r from-transparent via-brand-accent to-transparent"></div>
          </div>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-brand-text-dim max-w-2xl mx-auto mb-4 leading-relaxed">
          Oops! The page you're looking for seems to have vanished into the
          digital void.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={handleGoHome}
            className="group inline-flex items-center justify-center gap-2 bg-brand-accent text-white py-3 px-8 rounded-full font-semibold text-base hover:bg-brand-accent-dark transition-all duration-300 shadow-custom-glow hover:shadow-xl hover:scale-105 w-full sm:w-auto"
          >
            <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            Go to Home
          </button>

          <button
            onClick={handleDiscover}
            className="group inline-flex items-center justify-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white py-3 px-8 rounded-full font-semibold text-base hover:bg-white/10 hover:border-brand-accent/50 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Discover Events
          </button>

          <button
            onClick={handleGoBack}
            className="group inline-flex items-center justify-center gap-2 text-brand-text-dim hover:text-brand-accent py-3 px-6 rounded-full font-medium text-base transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="glass-effect border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-brand-accent" />
            <h3 className="text-lg font-semibold text-white">
              Looking for something specific?
            </h3>
          </div>
          <p className="text-sm text-brand-text-dim mb-6">
            Try these popular destinations instead:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/home")}
              className="text-sm text-brand-text-dim hover:text-brand-accent hover:bg-white/5 py-2 px-4 rounded-lg transition-all duration-200"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/discover")}
              className="text-sm text-brand-text-dim hover:text-brand-accent hover:bg-white/5 py-2 px-4 rounded-lg transition-all duration-200"
            >
              Discover Events
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-sm text-brand-text-dim hover:text-brand-accent hover:bg-white/5 py-2 px-4 rounded-lg transition-all duration-200"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/my-bookings")}
              className="text-sm text-brand-text-dim hover:text-brand-accent hover:bg-white/5 py-2 px-4 rounded-lg transition-all duration-200"
            >
              My Bookings
            </button>
          </div>
        </div>

        {/* Error Code Reference */}
        <p className="text-xs text-brand-text-dim/50 mt-8">
          Error Code: 404 | Page Not Found
        </p>
      </div>
    </main>
  );
};

export default ErrorPage;
