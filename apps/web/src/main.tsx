import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css";
import { RouterProvider } from "react-router";
import { router } from "./router";
import { ViewModeProvider } from "./components/common/ViewModeProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="min-h-dvh bg-page text-ink">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <ViewModeProvider>
          <RouterProvider router={router} />
        </ViewModeProvider>
      </div>
    </div>
  </React.StrictMode>,
);
