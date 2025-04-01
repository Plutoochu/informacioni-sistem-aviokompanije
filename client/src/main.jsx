import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { store } from "./redux/store.jsx";
import { Provider } from "react-redux";
import AppRuter from "./AppRuter.jsx";
import "./stilovi/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <AppRuter />
    </Provider>
  </StrictMode>
);
