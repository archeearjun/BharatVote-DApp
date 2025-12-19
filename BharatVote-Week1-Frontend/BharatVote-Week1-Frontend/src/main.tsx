import './polyfills';
import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import theme from "./theme";
import './index.css';

const initializeApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element with id 'root' not found");
  }

  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
};

// Start app with graceful error handling
try {
  initializeApp();
} catch (err) {
  console.error("App initialization error:", err);
  const fallback = document.createElement("div");
  fallback.style.color = "red";
  fallback.style.padding = "1rem";
  fallback.innerText = "An unexpected error occurred. Please reload the page.";
  document.body.appendChild(fallback);
}

