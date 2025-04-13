import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const prijava = async (podaci) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/user/login`,
      {
        email: podaci.usernameEmail,
        lozinka: podaci.password,
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Greška pri prijavi:", error);
    throw error;
  }
};

export const registracija = async (podaci) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/auth/registracija`,
      podaci
    );
    return response.data;
  } catch (error) {
    console.error("Greška pri registraciji:", error);
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

export const dobijSveKorisnike = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${backendUrl}/api/admin/korisnici`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri dohvaćanju korisnika:", error);
    throw error;
  }
};

export const dodajKorisnika = async (noviKorisnik) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${backendUrl}/api/admin/korisnici`,
      noviKorisnik,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Greška pri dodavanju korisnika:", error);
    throw error;
  }
};

export const promovisiNaAdmina = async (userId) => {
  try {
    const response = await axios.put(
      `${backendUrl}/api/admin/korisnici/${userId}/promoviraj`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Greška pri promoviranju korisnika:", error);
    throw error;
  }
};

export const demovisiToKorisnika = async (userId) => {
  try {
    const response = await axios.put(
      `${backendUrl}/api/admin/korisnici/${userId}/demoviraj`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Greška pri demoviranje korisnika:", error);
    throw error;
  }
};

export const obrisiKorisnika = async (userId) => {
  try {
    const response = await axios.delete(
      `${backendUrl}/api/admin/korisnici/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Greška pri brisanju korisnika:", error);
    throw error;
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

export const dohvatiSveZrakoplove = async () => {
  try {
    const response = await axios.get("/api/avioni");
    return response.data;
  } catch (error) {
    console.error("Greška pri dohvaćanju zrakoplova:", error);
    throw error;
  }
};

export const dodajZrakoplov = async (podaci) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/admin/avioni`,
      podaci,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    return response.data;
  } catch (error) {
    console.error("Greška pri dodavanju zrakoplova:", error);
    throw error;
  }
};

export const azurirajZrakoplov = async (id, podaci) => {
  try {
    const response = await axios.put(
      `${backendUrl}/api/admin/avioni${id}`,
      podaci,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Greška pri ažuriranju zrakoplova:", error);
    throw error;
  }
};

export const obrisiZrakoplov = async (id) => {
  try {
    const response = await axios.delete(
      `${backendUrl}/api/admin/avioni/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Greška pri brisanju zrakoplova:", error);
    throw error;
  }
};

export const dohvatiTipoveZrakoplova = async () => {
  try {
    const response = await axios.get(`${backendUrl}/api/avioni`, {
      headers: {
        "Content-Type": "application/json",
      },

      timeout: 10000, // Increase timeout for debugging
    });
    return response.data;
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      code: error.code,
      response: error.response,
      request: error.request
        ? "Request was made but no response"
        : "No request was made",
    });
    throw error;
  }
};
