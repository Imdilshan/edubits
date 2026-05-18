import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import "./styles/variables.css";
import "./styles/global.css";
import "./styles/taskTracker.css";
import "./features/quiz/styles/quizEngine.css";

ReactDOM.createRoot(document.getElementById("root")).render(

    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <>
            <App />
            <Analytics />
            <SpeedInsights />
          </>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
);

// import React from "react";
// import ReactDOM from "react-dom/client";

// import UploadTest from "./UploadTest";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <UploadTest />
// );
