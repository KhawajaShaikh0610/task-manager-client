"use client";
import { useAuth } from "../../context/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [registerError, setRegisterError] = useState(null);

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
              <span className="spinner"></span> Registering...
            </span>
          ) : (
            "Register"
          )}
        </button>
      </form>
    </div>
  );
}

// "use client";
// import { useAuth } from "../../context/AuthContext";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { useState } from "react";

// export default function RegisterPage() {
//   const { register } = useAuth();
//   const [registerError, setRegisterError] = useState(null);

//   const validationSchema = Yup.object().shape({
//     username: Yup.string()
//       .min(3, "Username must be at least 3 characters")
//       .max(30, "Username cannot exceed 30 characters")
//       .required("Username is required"),
//     email: Yup.string()
//       .email("Invalid email address")
//       .required("Email is required"),
//     password: Yup.string()
//       .min(6, "Password must be at least 6 characters")
//       .required("Password is required"),
//   });

//   const formik = useFormik({
//     initialValues: {
//       username: "",
//       email: "",
//       password: "",
//     },
//     validationSchema,
//     onSubmit: async (values, { setSubmitting }) => {
//       setRegisterError(null);
//       try {
//         await register(values.username, values.email, values.password);
//       } catch (error) {
//         setRegisterError(error.message || "Registration failed");
//       } finally {
//         setSubmitting(false);
//       }
//     },
//   });

//   return (
//     <form onSubmit={formik.handleSubmit}>
//       {registerError && (
//         <div className="alert alert-error">{registerError}</div>
//       )}

//       <div>
//         <input
//           name="username"
//           value={formik.values.username}
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//           placeholder="Username"
//           className={
//             formik.touched.username && formik.errors.username ? "error" : ""
//           }
//         />
//         {formik.touched.username && formik.errors.username && (
//           <div className="error-message">{formik.errors.username}</div>
//         )}
//       </div>

//       <div>
//         <input
//           name="email"
//           type="email"
//           value={formik.values.email}
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//           placeholder="Email"
//           className={formik.touched.email && formik.errors.email ? "error" : ""}
//         />
//         {formik.touched.email && formik.errors.email && (
//           <div className="error-message">{formik.errors.email}</div>
//         )}
//       </div>

//       <div>
//         <input
//           name="password"
//           type="password"
//           value={formik.values.password}
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//           placeholder="Password"
//           className={
//             formik.touched.password && formik.errors.password ? "error" : ""
//           }
//         />
//         {formik.touched.password && formik.errors.password && (
//           <div className="error-message">{formik.errors.password}</div>
//         )}
//       </div>

//       <button type="submit" disabled={formik.isSubmitting || !formik.isValid}>
//         {formik.isSubmitting ? "Registering..." : "Register"}
//       </button>
//     </form>
//   );
// }

// "use client";
// import { useState } from "react";
// import { useAuth } from "../../context/AuthContext";

// export default function RegisterPage() {
//   const { register } = useAuth();
//   const [form, setForm] = useState({ username: "", email: "", password: "" });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await register(form.username, form.email, form.password);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         value={form.username}
//         onChange={(e) => setForm({ ...form, username: e.target.value })}
//         placeholder="Username"
//       />
//       <input
//         value={form.email}
//         onChange={(e) => setForm({ ...form, email: e.target.value })}
//         placeholder="Email"
//       />
//       <input
//         type="password"
//         value={form.password}
//         onChange={(e) => setForm({ ...form, password: e.target.value })}
//         placeholder="Password"
//       />
//       <button>Register</button>
//     </form>
//   );
// }
