import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./globals.css";
import App from "./App.jsx";
import "./App.css";
import Chart from "@/components/chart";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App>
      <div className="flex flex-1 flex-row gap-4">
        <div className="aspect-video flex-1  rounded-xl bg-muted/50 " />
        <div className="aspect-video flex-1  rounded-xl bg-muted/50" />
        <div className="aspect-video flex-1 rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <Chart />
      </div>
    </App>
  </StrictMode>
);
