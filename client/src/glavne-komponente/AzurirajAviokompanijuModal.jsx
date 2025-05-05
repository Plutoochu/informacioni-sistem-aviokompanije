import React, { useState, useEffect } from "react";
import { azurirajAviokompaniju } from "../pomocne-funkcije/fetch-funkcije";

const AzurirajAviokompanijuModal = ({ show, onClose, onSuccess, aviokompanija }) => {
  const [formData, setFormData] = useState({
    naziv: "",
    logo: "",
    opis: "",
    godinaOsnivanja: "",
    sediste: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (aviokompanija) {
      setFormData({
        naziv: aviokompanija.naziv || "",
        logo: aviokompanija.logo || "",
        opis: aviokompanija.opis || "",
        godinaOsnivanja: aviokompanija.godinaOsnivanja || "",
        sediste: aviokompanija.sediste || ""
      });
    }
  }, [aviokompanija]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await azurirajAviokompaniju(aviokompanija._id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Došlo je do greške pri ažuriranju aviokompanije");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Ažuriraj aviokompaniju</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Naziv</label>
            <input
              type="text"
              name="naziv"
              value={formData.naziv}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Logo URL</label>
            <input
              type="text"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Opis</label>
            <textarea
              name="opis"
              value={formData.opis}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Godina osnivanja</label>
              <input
                type="number"
                name="godinaOsnivanja"
                value={formData.godinaOsnivanja}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Sjedište</label>
              <input
                type="text"
                name="sediste"
                value={formData.sediste}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={isSubmitting}
            >
              Odustani
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Ažuriranje..." : "Ažuriraj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AzurirajAviokompanijuModal;