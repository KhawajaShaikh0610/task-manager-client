"use client";
import { createContext, useContext, useState } from "react";
import axiosFetch from "../utils/axiosFetch";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const resp = await axiosFetch.post("/user/login", { email, password });
    setUser({ email });
    Cookies.set("user", JSON.stringify(resp?.data), {
      expires: 1,
      sameSite: "Strict",
    });
    // console.log(resp);
    const userId = resp?.data?.user?.id || resp?.data?.user?._id;
    if (userId) {
      router.push(`/task/${userId}`);
    } else {
      console.error("User ID not found in response");
    }
  };

  const register = async (username, email, password) => {
    await axiosFetch.post("/user/register", { username, email, password });
    router.push("/");
  };

  const logout = async () => {
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
