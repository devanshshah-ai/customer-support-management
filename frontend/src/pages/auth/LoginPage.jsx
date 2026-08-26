import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/reduxHooks";

import { loginUser } from "../../features/auth/authThunks";

import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, loading, error, isAuthenticated } =
    useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(result)) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <main className="login-page">
      <div className="login-background-shape login-shape-one" />
      <div className="login-background-shape login-shape-two" />

      <div className="login-wrapper">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-logo">
            CS
          </div>

          <div className="login-brand-text">
            <h1>Customer Support</h1>
            <span>Management System</span>
          </div>
        </div>

        {/* 3D Card */}
        <div className="login-card-scene">
          <div className="login-card-shadow" />

          <section className="login-card">
            <div className="login-card-top">
              <div>
                <h2>Welcome back</h2>
                <p>
                  Sign in to access your workspace
                </p>
              </div>

              <div className="login-card-status">
                <span />
                Secure
              </div>
            </div>

            {error && (
              <div className="login-error">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>

                <span>{error}</span>
              </div>
            )}

            <form
              className="login-form"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Email */}
              <div className="login-field">
                <label htmlFor="email">
                  Email address
                  <span>*</span>
                </label>

                <div className="login-input">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                    <path d="m3 7 9 6 9-6" />
                  </svg>

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    {...register("email", {
                      required:
                        "Email is required",
                      pattern: {
                        value:
                          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message:
                          "Enter a valid email address",
                      },
                    })}
                  />
                </div>

                {errors.email && (
                  <span className="field-error">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="login-field">
                <div className="password-header">
                  <label htmlFor="password">
                    Password
                    <span>*</span>
                  </label>
                </div>

                <div className="login-input">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                    />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>

                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...register("password", {
                      required:
                        "Password is required",
                    })}
                  />
                </div>

                {errors.password && (
                  <span className="field-error">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Remember */}
              <label className="remember-row">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                />

                <span className="custom-check" />

                <span>Remember me</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    Signing in
                  </>
                ) : (
                  <>
                    Sign in

                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="login-card-footer">
              <span className="security-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2 3 6v6c0 5.25 3.84 9.74 9 10 5.16-.26 9-4.75 9-10V6l-9-4Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>

              <span>
                Secure access to your workspace
              </span>
            </div>
          </section>
        </div>

        <footer className="login-footer">
          <span>
            Customer Support Management System
          </span>

          <span className="footer-dot">•</span>

          <span>v1.0.0</span>
        </footer>
      </div>
    </main>
  );
};

export default LoginPage;