import { createSlice } from "@reduxjs/toolkit";

//const initialState = {
//  prijavljen: false,
//};
const initialState = {
  prijavljen: true,
  korisnik: {
    _id: "123456",
    ime: "Ahmed",
    prezime: "Ahmo",
    email: "a@example.com",
    telefon: "0611234567"
  },
};
setKorisnik: (state, action) => {
  state.korisnik = action.payload;
}


export const aviosistemSlice = createSlice({
  name: "aviosistem",
  initialState,
  reducers: {
    setPrijavljen: (state, action) => {
      state.prijavljen = action.payload;
    },
  },
});


export const { setPrijavljen, setKorisnik } = aviosistemSlice.actions;

export default aviosistemSlice.reducer;
