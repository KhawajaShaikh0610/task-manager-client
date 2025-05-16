"use client";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [loginError, setLoginError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoginError(null);
      try {
        await login(values.email, values.password);
      } catch (error) {
        alert("Invalid Credentials");
        toast.error("Invalid Credentials");
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleNavigate = () => {
    router.push("/register");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <div className="register-container">
        <form onSubmit={formik.handleSubmit} className="register-form">
          <h2 className="form-title">Welcome Back</h2>

          {loginError && <div className="alert alert-error">{loginError}</div>}

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
              <div className="button-loading">
                <div className="spinner"></div> Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>

          <div className="auth-footer">
            <div className="footer-text">Don't have an account?</div>
            <button
              type="button"
              onClick={handleNavigate}
              className="footer-button"
            >
              Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
