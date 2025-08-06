import express from 'express';
import { searchCustomers, addCustomer, getCustomers, deleteCustomer, updateCustomer, updateLoyaltyPoints, redeemLoyaltyPoints } from '../controllers/customerController.js'; // Make sure this is correct

const router = express.Router();

// Define your routes
router.get("/search", searchCustomers);  // This is where the search is handled
router.post("/add", addCustomer);
router.get("/", getCustomers);
router.delete("/:id", deleteCustomer);
router.put("/:id", updateCustomer);
router.put("/:id/loyalty-points", updateLoyaltyPoints);
router.post("/:id/redeem-points", redeemLoyaltyPoints);

export default router;
