import axios from "axios";

const backendUrl = "http://localhost:5000";

const dohvatiCjenovnik = async () => {
  try {
    const response = await axios.get(`${backendUrl}/api/cijene`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška:", error);
    throw error;
  }
};

const dodajCijenu = async (podaci) => {
  try {
    const response = await axios.post(`${backendUrl}/api/cijene`, podaci, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška:", error);
    throw error;
  }
};

const azurirajCijenu = async (id, podaci) => {
  try {
    const response = await axios.put(`${backendUrl}/api/cijene/${id}`, podaci, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška:", error);
    throw error;
  }
};

const obrisiCijenu = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/api/cijene/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Greška:", error);
    throw error;
  }
};

export { dohvatiCjenovnik, dodajCijenu, azurirajCijenu, obrisiCijenu };
