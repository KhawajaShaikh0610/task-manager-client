"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form.email, form.password);
  };

  const handleNavigate = () => {
    router.push("/register");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleNavigate}>Go to Register</button>
    </div>
  );
}
