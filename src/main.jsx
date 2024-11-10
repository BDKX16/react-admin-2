import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./globals.css";
import App from "./App.jsx";
import "./App.css";
import { useSelector } from "react-redux";

const Main = () => {
  return (
    <StrictMode>
      <App></App>
    </StrictMode>
  );
};

createRoot(document.getElementById("root")).render(<Main />);
