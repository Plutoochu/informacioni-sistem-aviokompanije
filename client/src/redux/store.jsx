import { configureStore } from "@reduxjs/toolkit";
import aviosistemReducer from "./aviosistem";

export const store = configureStore({
  reducer: {
    aviosistem: aviosistemReducer,
  },
});
