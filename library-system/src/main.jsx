import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import { UIProvider } from "./app/ui";
import { seed } from "./services/storage";
import "./index.css";

// populăm localStorage cu date demo la primul load pentru a avea conținut
seed();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UIProvider>
      <RouterProvider router={router} />
    </UIProvider>
  </React.StrictMode>
);
