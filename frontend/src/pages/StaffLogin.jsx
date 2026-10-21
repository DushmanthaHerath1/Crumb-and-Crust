import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

import { Field } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { useAdminAuth } from "../hooks/useAdminAuth";

export default function StaffLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAdminAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setServerError("");

    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

    try {
      // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
      const body = new URLSearchParams({
        username: formData.email.trim(),
        password: formData.password,
      });

      const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setServerError("Invalid email or password");
        } else {
          setServerError("Unable to sign in. Please verify your connection.");
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (data.access_token) {
        login(data.access_token);
        navigate("/admin/dashboard", { replace: true });
      } else {
        setServerError("Failed to retrieve authentication token.");
      }
    } catch {
      setServerError("Network error. Please check your server connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-md border border-gray-300/60 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-12">
        <div className="flex flex-col items-center gap-5 text-center">
          <Lock className="size-6 text-black " aria-hidden="true" />
          <h1 className="font-heading text-3xl font-bold tracking-tight text-black">
            Staff Login
          </h1>
        </div>

        {serverError && (
          <div
            role="alert"
            className="flex w-full items-center gap-3 rounded-sm border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
          <Field
            id="email"
            label="EMAIL ADDRESS"
            type="email"
            placeholder="your username"
            autoComplete="username"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
            icon={Mail}
            variant="light"
            disabled={isLoading}
            required
          />

          <Field
            id="password"
            label="PASSWORD"
            type={showPassword ? "text" : "password"}
            placeholder="your passowrd"
            autoComplete="current-password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            error={errors.password}
            icon={Lock}
            variant="light"
            disabled={isLoading}
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="rounded p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-container"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            }
          />

          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleChange("rememberMe", e.target.checked)}
                className="size-4 rounded-sm border border-gray-300 bg-white accent-primary-container focus:ring-primary-container"
              />
              <span className="font-body text-sm text-gray-600">
                Remember me
              </span>
            </label>

            <button
              type="button"
              onClick={() =>
                alert(
                  "Staff credentials are individual and managed by bakery management. Please contact the store owner to reset your access.",
                )
              }
              className="font-body text-sm font-medium text-[#ca5010] hover:underline transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={isLoading}
            className="mt-2 w-full rounded-sm"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
