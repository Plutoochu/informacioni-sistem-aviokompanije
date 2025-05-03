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
    const response = await axios.post(`${backendUrl}/api/auth/registracija`, podaci);
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
    const response = await axios.get(`${backendUrl}/api/admin/korisnici`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    const response = await axios.post(`${backendUrl}/api/admin/korisnici`, noviKorisnik, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
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
    const response = await axios.delete(`${backendUrl}/api/admin/korisnici/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri brisanju korisnika:", error);
    throw error;
  }
};

export const azurirajKorisnika = async (id, token, podaci) => {
  try {
    const res = await axios.put(`${backendUrl}/api/korisnici/update/${id}`, podaci, {
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
    const response = await axios.get(`${backendUrl}/api/admin/avioni`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri dohvaćanju zrakoplova:", error);
    throw error;
  }
};

export const dodajZrakoplov = async (podaci) => {
  try {
    const response = await axios.post(`${backendUrl}/api/admin/avioni`, podaci, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri dodavanju zrakoplova:", error);
    throw error;
  }
};

export const azurirajZrakoplov = async (id, podaci) => {
  try {
    const response = await axios.put(`${backendUrl}/api/admin/avioni/${id}`, podaci, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri ažuriranju zrakoplova:", error);
    throw error;
  }
};

export const obrisiZrakoplov = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/api/admin/avioni/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
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
      request: error.request ? "Request was made but no response" : "No request was made",
    });
    throw error;
  }
};

export const dohvatiDestinacije = async () => {
  try {
    const response = await axios.get(`${backendUrl}/api/admin/destinacije`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri dohvaćanju destinacija:", error);
    throw error;
  }
};

export const dodajDestinaciju = async (podaci) => {
  try {
    const response = await axios.post(`${backendUrl}/api/admin/destinacije`, podaci, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri dodavanju destinacije:", error);
    throw error;
  }
};

export const azurirajDestinaciju = async (id, podaci) => {
  try {
    const response = await axios.put(`${backendUrl}/api/admin/destinacije/${id}`, podaci, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri ažuriranju destinacije:", error);
    throw error;
  }
};

export const obrisiDestinaciju = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/api/admin/destinacije/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri brisanju destinacije:", error);
    throw error;
  }
};

export const dohvatiSveLetove = async () => {
  try {
    const response = await axios.get(`${backendUrl}/api/admin/letovi`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri dohvaćanju letova:", error);
    throw error;
  }
};

export const dodajLet = async (podaci) => {
  try {
    const response = await axios.post(`${backendUrl}/api/admin/letovi`, podaci, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri dodavanju leta:", error);

    if (error.response) {
      console.error("Backend response:", error.response.data);
    }

    throw error;
  }
};

export const azurirajLet = async (id, podaci) => {
  try {
    const response = await axios.put(`${backendUrl}/api/admin/letovi/${id}`, podaci, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri ažuriranju leta:", error);
    throw error;
  }
};

export const otkaziLet = async (podaci) => {
  try {
    const response = await axios.post(`${backendUrl}/api/admin/letovi/otkazi`, podaci, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri otkazivanju leta:", error);

    if (error.response) {
      console.error("Backend response:", error.response.data);
    }

    throw error;
  }
};

export const dohvatiOtkazaneLetove = async () => {
  try {
    const response = await axios.get(`${backendUrl}/api/admin/otkazani-letovi`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri dohvaćanju otkazanih letova:", error);
    throw error;
  }
};

export const aktivirajLet = async (data) => {
  const token = localStorage.getItem("token");

  const response = await axios.delete(`${backendUrl}/api/admin/letovi/otkazi`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: data,
  });

  return response.data;
};

export const dohvatiNotifikacije = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${backendUrl}/api/korisnici/moje-notifikacije`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška pri dohvaćanju notifikacija:", error);
    throw error;
  }
};

export const oznaciKaoProcitano = async (notificationId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${backendUrl}/api/korisnici/notifikacije/${notificationId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Greška pri označavanju notifikacije:", err);
    throw err;
  }
};
