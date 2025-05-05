import axios from "axios";

const backendUrl = "http://localhost:5000";

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
