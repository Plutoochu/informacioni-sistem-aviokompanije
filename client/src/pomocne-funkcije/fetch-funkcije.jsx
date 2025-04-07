import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const prijava = async (podaci) => {
  try {
    const response = await axios.post(`${backendUrl}/api/auth/prijava`, podaci, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Greška pri prijavi:', error);
    throw error;
  }
};

export const registracija = async (podaci) => {
  try {
    const response = await axios.post(`${backendUrl}/api/auth/registracija`, podaci, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Greška pri registraciji:', error);
    throw error;
  }
};


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

export const azurirajKorisnika = async (id, token, podaci) => {
  try {
    const res = await axios.put(`${backendUrl}/api/user/update/${id}`, podaci, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.log(err);
    throw err.response.data;
  }
};