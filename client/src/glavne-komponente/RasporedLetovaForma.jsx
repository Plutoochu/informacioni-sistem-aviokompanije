import React, { useState } from "react";
import { dodajLet, azurirajLet } from "../pomocne-funkcije/fetch-funkcije"; // Import the functions from your API service
import "../stilovi/RasporedLetova.css"; // Import the updated CSS file

const RasporedLetovaForma = ({ flightData, isEditing }) => {
  const [formData, setFormData] = useState({
    flightNumber: flightData?.flightNumber || "",
    departureTime: flightData?.departureTime || "",
    arrivalTime: flightData?.arrivalTime || "",
    origin: flightData?.origin || "",
    destination: flightData?.destination || "",
    aircraftType: flightData?.aircraftType || "",
    seatConfiguration: flightData?.seatConfiguration || "",
    schedule: flightData?.schedule || "",
    validityFrom: flightData?.validityFrom || "",
    validityTo: flightData?.validityTo || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        const updatedFlight = await azurirajLet(flightData.id, formData);
        alert("Flight schedule updated successfully!");
      } else {
        const newFlight = await dodajLet(formData);
        alert("Flight schedule added successfully!");
      }

      // Reset the form or navigate away, depending on your flow
      setFormData({
        flightNumber: "",
        departureTime: "",
        arrivalTime: "",
        origin: "",
        destination: "",
        aircraftType: "",
        seatConfiguration: "",
        schedule: "",
        validityFrom: "",
        validityTo: "",
      });
    } catch (error) {
      alert("Error while saving flight schedule!");
    }
  };

  return (
    <div className="flight-schedule-form">
      <h2>{isEditing ? "Edit Flight Schedule" : "Schedule a Flight"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="flightNumber">Flight Number</label>
          <input
            type="text"
            id="flightNumber"
            name="flightNumber"
            value={formData.flightNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="departureTime">Departure Time</label>
          <input
            type="datetime-local"
            id="departureTime"
            name="departureTime"
            value={formData.departureTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="arrivalTime">Arrival Time</label>
          <input
            type="datetime-local"
            id="arrivalTime"
            name="arrivalTime"
            value={formData.arrivalTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="origin">Origin</label>
          <input
            type="text"
            id="origin"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="destination">Destination</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="aircraftType">Aircraft Type</label>
          <input
            type="text"
            id="aircraftType"
            name="aircraftType"
            value={formData.aircraftType}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="seatConfiguration">Seat Configuration</label>
          <input
            type="text"
            id="seatConfiguration"
            name="seatConfiguration"
            value={formData.seatConfiguration}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="schedule">Schedule (Flights of Operation)</label>
          <input
            type="text"
            id="schedule"
            name="schedule"
            value={formData.schedule}
            onChange={handleChange}
            placeholder="e.g., 1234567 or x56"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="validityFrom">Validity From</label>
          <input
            type="date"
            id="validityFrom"
            name="validityFrom"
            value={formData.validityFrom}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="validityTo">Validity To</label>
          <input
            type="date"
            id="validityTo"
            name="validityTo"
            value={formData.validityTo}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-submit">
          {isEditing ? "Update" : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default RasporedLetovaForma;
