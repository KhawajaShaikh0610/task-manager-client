"use client";
import { useAuth } from "../../context/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const [registerError, setRegisterError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .required("Username is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setRegisterError(null);
      try {
        await register(values.username, values.email, values.password);
      } catch (error) {
        setRegisterError(error.message || "Registration failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const router = useRouter();

  const handleNavigate = () => {
    router.push("/");
  };

  return (
    <div className="register-container">
      <form onSubmit={formik.handleSubmit} className="register-form">
        <h2 className="form-title">Create Your Account</h2>

        {registerError && (
          <div className="alert alert-error">{registerError}</div>
        )}

        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            id="username"
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Enter your username"
            className={`form-input ${
              formik.touched.username && formik.errors.username
                ? "input-error"
                : ""
            }`}
          />
          {formik.touched.username && formik.errors.username && (
            <div className="error-message">{formik.errors.username}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Enter your email"
            className={`form-input ${
              formik.touched.email && formik.errors.email ? "input-error" : ""
            }`}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="error-message">{formik.errors.email}</div>
          )}
        </div>

        <div className="form-group password-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="password-input-container">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your password"
              className={`form-input ${
                formik.touched.password && formik.errors.password
                  ? "input-error"
                  : ""
              }`}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🔓" : "🔒"}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <div className="error-message">{formik.errors.password}</div>
          )}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {formik.isSubmitting ? (
            <span className="button-loading">
              <span className="spinner"></span> Registering...
            </span>
          ) : (
            "Register"
          )}
        </button>

        <div className="auth-footer">
          <div className="footer-text">Already have an account?</div>
          <button
            type="button"
            onClick={handleNavigate}
            className="footer-button"
          >
            Login here
          </button>
        </div>
      </form>
    </div>
  );
}
