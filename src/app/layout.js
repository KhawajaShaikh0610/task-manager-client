"use client";
import { Provider } from "react-redux";
import { AuthProvider } from "../context/AuthContext";
import { store } from "./redux/store";

// export const metadata = {
//   title: "Task App",
// };

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
