import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
// Sayfa yönlendirmelerini (Routing) kullanabilmek için BrowserRouter ekliyoruz.
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* App bileşeni artık yönlendirici (router) içinde çalışıyor */}
      <App />
    </BrowserRouter>
  </StrictMode>,
);
