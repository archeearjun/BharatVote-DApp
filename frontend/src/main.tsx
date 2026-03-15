import './polyfills';
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { I18nProvider } from './i18n';
import './index.css';

const initializeApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element with id 'root' not found");
  }

  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <I18nProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </I18nProvider>
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
