import { Aviokompanija } from "../modeli/modeli.js";

export const dodajAviokompaniju = async (req, res) => {
  try {
    const novaAviokompanija = await Aviokompanija.create(req.body);
    res.status(201).json(novaAviokompanija);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const dohvatiSveAviokompanije = async (req, res) => {
  try {
    const aviokompanije = await Aviokompanija.find();
    res.status(200).json(aviokompanije);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const azurirajAviokompaniju = async (req, res) => {
  try {
    const azuriranaAviokompanija = await Aviokompanija.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(azuriranaAviokompanija);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const obrisiAviokompaniju = async (req, res) => {
  try {
    await Aviokompanija.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Aviokompanija uspješno obrisana" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};