import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const provjeraAplikacije = async () => {
  try {
    const res = await axios.get(`${backendUrl}/api/admin/provjera`);
    console.log(res);
    return res.data.poruka;
  } catch (err) {
    console.log(err);
    return false;
  }
};
