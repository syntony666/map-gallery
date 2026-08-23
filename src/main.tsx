import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css";
import { RouterProvider } from "react-router";
import { router } from "./router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"
    ></link>
    <main className="min-h-screen bg-stone-100 text-stone-800">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <RouterProvider router={router} />
      </div>
    </main>
  </React.StrictMode>,
);
