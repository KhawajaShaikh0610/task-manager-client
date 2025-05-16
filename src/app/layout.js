"use client";
import { Provider } from "react-redux";
import { AuthProvider } from "../context/AuthContext";
import { store } from "./redux/store";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Provider store={store}>
          <AuthProvider>{children}</AuthProvider>
          <Toaster position="bottom-center" />
        </Provider>
      </body>
    </html>
  );
}
