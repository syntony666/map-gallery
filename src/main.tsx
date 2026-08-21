import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css";
import { RouterProvider } from "react-router";
import { router } from "./router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main className="h-screen flex flex-col overflow-hidden bg-stone-100 text-stone-800">
      <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-4">
        <RouterProvider router={router} />
      </div>
    </main>
  </React.StrictMode>,
);
