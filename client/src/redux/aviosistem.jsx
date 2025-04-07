import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  prijavljen: true,
  korisnik: undefined,
};
export const aviosistemSlice = createSlice({
  name: "aviosistem",
  initialState,
  reducers: {
    setPrijavljen: (state, action) => {
      state.prijavljen = action.payload;
    },
    setKorisnik: (state, action) => {
      state.korisnik = action.payload;
    },
  },
});

export const { setPrijavljen, setKorisnik } = aviosistemSlice.actions;

export default aviosistemSlice.reducer;
