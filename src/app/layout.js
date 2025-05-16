"use client";
import { Provider } from "react-redux";
import { AuthProvider } from "../context/AuthContext";
import { store } from "./redux/store";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Provider store={store}>
          <AuthProvider>{children}</AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
