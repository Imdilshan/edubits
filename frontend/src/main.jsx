import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";

import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

import "./styles/variables.css";
import "./styles/components.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(

    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
);
