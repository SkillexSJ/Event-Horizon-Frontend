import { Link, useNavigate, useLocation } from "react-router";
import { useSignup } from "../../api/useUser.ts";
import { useState } from "react";
import { useAuth } from "../../Provider/AuthProvider";
import { UserPlus, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { errorToastOptions, toastOptions } from "../../utils/constant.ts";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const { mutate, isPending, isError, error } = useSignup();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    isHost: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //! Validate REGEX
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        if (!/(?=.*[a-z])/.test(value))
          return "Password must contain at least one lowercase letter";
        if (!/(?=.*[A-Z])/.test(value))
          return "Password must contain at least one uppercase letter";
        if (!/(?=.*\d)/.test(value))
          return "Password must contain at least one number";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [id]: newValue }));

    // Clear error when user starts typing
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  //! Validate on blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const error = validateField(id, value);
    setErrors((prev) => ({ ...prev, [id]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirmPassword: validateField(
        "confirmPassword",
        formData.confirmPassword
      ),
    };

    setErrors(newErrors);

    //! Check if there are any errors
    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }

    mutate(
      {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        is_host: formData.isHost,
      },
      {
        onSuccess: (data) => {
          //! Update AuthProvider
          authLogin(data.token, {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            is_host: data.user.is_host,
          });

          toast.success("Signup successful!", toastOptions);

          //! Get the page user come from
          const from =
            (location.state as { from?: { pathname: string } })?.from
              ?.pathname ||
            (data.user.is_host ? "/admin/dashboard" : "/discover");

          // !Redirect
          navigate(from, { replace: true });
        },
        onError: (err) => {
          toast.error("Signup failed", errorToastOptions);
          console.error("Signup failed:", err);
        },
      }
    );
  };

  return (
    <main className="w-full flex items-center justify-center min-h-screen pt-32 pb-24 px-4">
      <div className="w-full max-w-4xl bg-brand-surface rounded-2xl p-8 md:p-10 border border-white/10 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent/10 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-brand-accent" />
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-2">
            Create Your Account
          </h2>
          <p className="text-brand-text-dim">
            Join Event Horizon to discover and create amazing events
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Two Column Layout for Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-brand-text mb-2"
              >
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-brand-text placeholder-brand-text-dim focus:ring-2 focus:ring-brand-accent transition-all ${
                  errors.name
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/10 focus:border-brand-accent"
                }`}
                required
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-brand-text mb-2"
              >
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-brand-text placeholder-brand-text-dim focus:ring-2 focus:ring-brand-accent transition-all ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/10 focus:border-brand-accent"
                }`}
                required
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Two Column Layout for Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-brand-text mb-2"
              >
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 pr-12 text-brand-text placeholder-brand-text-dim focus:ring-2 focus:ring-brand-accent transition-all ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-white/10 focus:border-brand-accent"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-dim hover:text-brand-text transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-brand-text mb-2"
              >
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 pr-12 text-brand-text placeholder-brand-text-dim focus:ring-2 focus:ring-brand-accent transition-all ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-white/10 focus:border-brand-accent"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-dim hover:text-brand-text transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Host Checkbox */}
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
            <input
              type="checkbox"
              id="isHost"
              checked={formData.isHost}
              onChange={handleChange}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-accent focus:ring-2 focus:ring-brand-accent focus:ring-offset-0 cursor-pointer"
            />
            <label
              htmlFor="isHost"
              className="text-sm text-brand-text cursor-pointer flex-1"
            >
              <span className="font-semibold">Register as Event Host</span>
              <p className="text-xs text-brand-text-dim mt-0.5">
                Create and manage your own events
              </p>
            </label>
          </div>

          {/* Error message from API */}
          {isError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 font-semibold text-sm">
                  {error?.message || "Signup failed. Please try again."}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand-accent text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-accent-dark transition duration-300 shadow-custom-glow text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          {/* Log In Link */}
          <div className="text-center text-sm text-brand-text-dim pt-2">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="font-semibold text-brand-accent-light hover:text-brand-accent transition-colors"
            >
              Log In
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Signup;
