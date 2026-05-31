import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import VercelMetrics from "./app/VercelMetrics";

import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import "./styles/variables.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(

    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <>
            <App />
            <VercelMetrics />
          </>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
);
