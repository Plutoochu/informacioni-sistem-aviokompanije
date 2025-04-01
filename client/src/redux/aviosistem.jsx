import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  prijavljen: false,
};

export const aviosistemSlice = createSlice({
  name: "aviosistem",
  initialState,
  reducers: {
    setPrijavljen: (state, action) => {
      state.prijavljen = action.payload;
    },
  },
});

export const { setPrijavljen } = aviosistemSlice.actions;

export default aviosistemSlice.reducer;
