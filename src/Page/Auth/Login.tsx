import { Link, useNavigate, useLocation } from "react-router";
import { useLogin } from "../../api/useUser.ts";
import { useState } from "react";
import { useAuth } from "../../Provider/AuthProvider";
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { errorToastOptions, toastOptions } from "../../utils/constant.ts";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const { mutate, isPending, isError, error } = useLogin();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  //! Validate individual fields
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        return "";
      case "password":
        if (!value) return "Password is required";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [id]: newValue }));

    //! Clear error when user starts typing
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const error = validateField(id, value);
    setErrors((prev) => ({ ...prev, [id]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    //! Validate all fields
    const newErrors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
    };
    console.log("Validation Errors:", newErrors);

    setErrors(newErrors);

    //! Check if there are any other errors
    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }

    mutate(
      {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      },
      {
        onSuccess: (data) => {
          //! Update AuthProvider state
          authLogin(data.token, {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            is_host: data.user.is_host,
          });
          toast.success("Login successful!", toastOptions);

          // !Get the page user come from
          const from =
            (location.state as { from?: { pathname: string } })?.from
              ?.pathname ||
            (data.user.is_host ? "/admin/dashboard" : "/discover");

          //! Redirect
          navigate(from, { replace: true });
        },
        onError: (err) => {
          toast.error("Login failed", errorToastOptions);
          console.error("Login failed:", err);
        },
      }
    );
  };

  return (
    <main className="w-full flex items-center justify-center min-h-screen pt-32 pb-24 px-4">
      <div className="w-full max-w-md bg-brand-surface rounded-2xl p-8 border border-white/10 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent/10 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-brand-accent" />
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-2">
            Welcome Back
          </h2>
          <p className="text-brand-text-dim">
            Log in to access your Event Horizon account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-brand-text mb-2"
            >
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-brand-text-dim" />
              </div>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-white/5 border rounded-lg pl-10 pr-4 py-3 text-brand-text placeholder-brand-text-dim focus:ring-2 focus:ring-brand-accent transition-all ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/10 focus:border-brand-accent"
                }`}
                required
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-brand-text mb-2"
            >
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-brand-text-dim" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-white/5 border rounded-lg pl-10 pr-12 py-3 text-brand-text placeholder-brand-text-dim focus:ring-2 focus:ring-brand-accent transition-all ${
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

          {/* //! Error message from API */}
          {isError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 font-semibold text-sm">
                  {error?.message || "Invalid email or password"}
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
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-brand-text-dim pt-2">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="font-semibold text-brand-accent-light hover:text-brand-accent transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Login;
