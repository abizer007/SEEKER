import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")!).render(<App />);


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
