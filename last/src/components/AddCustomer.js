import React, { useState } from "react";
import axios from "axios";
import "./AddCustomer.css";

const AddCustomer = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerContact: "",
    email: "", // Optional field
    loyaltyPoints: 0,
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!/^[A-Za-z\s]+$/.test(formData.customerName)) {
      newErrors.customerName = "Must contain only letters!";
      valid = false;
    }

    if (!/^\d{10}$/.test(formData.customerContact)) {
      newErrors.customerContact = "Must contain 10 digits!";
      valid = false;
    }

    if (formData.email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      newErrors.email = "Invalid email format!";
      valid = false;
    }

    if (formData.loyaltyPoints < 0) {
      newErrors.loyaltyPoints = "Loyalty points cannot be negative!";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        console.log("Submitting:", formData); // Debugging
        const response = await axios.post("https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/customers/add", formData, {
          headers: { "Content-Type": "application/json" }
        });

        setMessage(response.data.message);
        setFormData({
          customerName: "",
          customerContact: "",
          email: "", // Reset optional field
          loyaltyPoints: 0,
        });

        setTimeout(() => {
          setMessage("");
        }, 10000);
      } catch (error) {
        console.error("Error response:", error.response || error);
        setMessage(error.response?.data?.error || "Failed to add customer!");
      }
    }
  };

  return (
    <div className="add-customer-container">
      <h2>Add Customer</h2>
      {message && <p className="success-message">{message}</p>}
      <form onSubmit={handleSubmit} className="add-customer-form">
        <div className="form-group">
          <label>Customer Name:</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            placeholder="Enter customer name"
          />
          {errors.customerName && <span className="error-text">{errors.customerName}</span>}
        </div>

        <div className="form-group">
          <label>Customer Contact:</label>
          <input
            type="text"
            name="customerContact"
            value={formData.customerContact}
            onChange={handleInputChange}
            placeholder="Enter contact number"
          />
          {errors.customerContact && <span className="error-text">{errors.customerContact}</span>}
        </div>

        <div className="form-group">
          <label>Email (Optional):</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email (if applicable)"
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Loyalty Points:</label>
          <input
            type="number"
            name="loyaltyPoints"
            value={formData.loyaltyPoints}
            onChange={handleInputChange}
            placeholder="Enter loyalty points"
            min="0"
          />
          {errors.loyaltyPoints && <span className="error-text">{errors.loyaltyPoints}</span>}
        </div>

        <button type="submit" className="add-button">Add</button>
      </form>
    </div>
  );
};

export default AddCustomer;
