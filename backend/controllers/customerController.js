import Customer from "../models/customerModel.js";

// Add a new customer
export const addCustomer = async (req, res) => {
  try {
    const { customerName, customerContact, email, loyaltyPoints } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ customerContact });
    if (existingCustomer) {
      return res.status(400).json({ error: "Customer with this contact already exists" });
    }

    const newCustomer = new Customer({
      customerName,
      customerContact,
      email,
      loyaltyPoints: loyaltyPoints || 0,
    });

    await newCustomer.save();
    res.status(201).json({ message: "Customer added successfully!", customer: newCustomer });
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({ error: "Failed to add customer." });
  }
};

// Get all customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers." });
  }
};

// Delete a customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    
    if (!deletedCustomer) {
      return res.status(404).json({ error: "Customer not found." });
    }
    
    res.status(200).json({ message: "Customer deleted successfully!" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: "Failed to delete customer." });
  }
};

// Update customer details
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, customerContact, email, loyaltyPoints } = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { customerName, customerContact, email, loyaltyPoints },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found." });
    }

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Failed to update customer." });
  }
};

// Search customers by contact number
export const searchCustomers = async (req, res) => {
  console.log("Search route hit", req.query);  // Log query params for debugging
  try {
    const { contact } = req.query;
    
    if (typeof contact !== 'string' || contact.length < 3) {
      return res.status(400).json({ 
        message: 'Please provide at least 3 characters to search' 
      });
    }

    const customers = await Customer.find({
      customerContact: { $regex: contact, $options: 'i' }
    }).limit(10);

    res.status(200).json(customers);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Failed to search customers" });
  }
};

// Update loyalty points for a customer
export const updateLoyaltyPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { loyaltyPoints } = req.body;

    if (loyaltyPoints < 0) {
      return res.status(400).json({ error: "Loyalty points cannot be negative." });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { loyaltyPoints },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found." });
    }

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("Error updating loyalty points:", error);
    res.status(500).json({ error: "Failed to update loyalty points." });
  }
};

// Redeem loyalty points for a customer
export const redeemLoyaltyPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { pointsToRedeem } = req.body;

    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return res.status(400).json({ error: "Points to redeem must be greater than 0." });
    }

    if (pointsToRedeem < 50) {
      return res.status(400).json({ error: "Minimum 50 points required for redemption." });
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }

    if (customer.loyaltyPoints < pointsToRedeem) {
      return res.status(400).json({ 
        error: `Insufficient points. Available: ${customer.loyaltyPoints}, Requested: ${pointsToRedeem}` 
      });
    }

    // Calculate redemption value (1 point = 1 rupee)
    const redemptionValue = pointsToRedeem;
    
    // Update customer's loyalty points
    customer.loyaltyPoints -= pointsToRedeem;
    await customer.save();

    res.status(200).json({
      message: `Successfully redeemed ${pointsToRedeem} points for ₹${redemptionValue}`,
      customer: customer,
      redeemedPoints: pointsToRedeem,
      redemptionValue: redemptionValue,
      remainingPoints: customer.loyaltyPoints
    });
  } catch (error) {
    console.error("Error redeeming loyalty points:", error);
    res.status(500).json({ error: "Failed to redeem loyalty points." });
  }
};
