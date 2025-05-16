"use client";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loginError, setLoginError] = useState(null);

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
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleNavigate = () => {
    router.push("/register");
  };

  return (
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

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
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
              <span className="spinner"></span> Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>

        <div className="auth-footer">
          <p className="footer-text">Don't have an account?</p>
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

    // <div>
    //   {loginError && <div className="alert alert-error">{loginError}</div>}

    //   <form onSubmit={formik.handleSubmit}>
    //     <div>
    //       <input
    //         name="email"
    //         type="email"
    //         value={formik.values.email}
    //         onChange={formik.handleChange}
    //         onBlur={formik.handleBlur}
    //         placeholder="Email"
    //         className={
    //           formik.touched.email && formik.errors.email ? "error" : ""
    //         }
    //       />
    //       {formik.touched.email && formik.errors.email && (
    //         <div className="error-message">{formik.errors.email}</div>
    //       )}
    //     </div>

    //     <div>
    //       <input
    //         name="password"
    //         type="password"
    //         value={formik.values.password}
    //         onChange={formik.handleChange}
    //         onBlur={formik.handleBlur}
    //         placeholder="Password"
    //         className={
    //           formik.touched.password && formik.errors.password ? "error" : ""
    //         }
    //       />
    //       {formik.touched.password && formik.errors.password && (
    //         <div className="error-message">{formik.errors.password}</div>
    //       )}
    //     </div>

    //     <button type="submit" disabled={formik.isSubmitting || !formik.isValid}>
    //       {formik.isSubmitting ? "Logging in..." : "Login"}
    //     </button>
    //   </form>
    //   <button onClick={handleNavigate}>Go to Register</button>
    // </div>
  );
}

// "use client";
// import { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//   const { login } = useAuth();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const router = useRouter();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await login(form.email, form.password);
//   };

//   const handleNavigate = () => {
//     router.push("/register");
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <input
//           value={form.email}
//           onChange={(e) => setForm({ ...form, email: e.target.value })}
//           placeholder="Email"
//         />
//         <input
//           type="password"
//           value={form.password}
//           onChange={(e) => setForm({ ...form, password: e.target.value })}
//           placeholder="Password"
//         />
//         <button type="submit">Login</button>
//       </form>
//       <button onClick={handleNavigate}>Go to Register</button>
//     </div>
//   );
// }
