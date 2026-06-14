import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { XAppWrapper } from "./components/common/PageMeta";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <XAppWrapper>
      <App />
    </XAppWrapper>
  </StrictMode>,
);
