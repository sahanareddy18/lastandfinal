import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, Input, message, Card, Statistic } from "antd";
import { GiftOutlined, DollarOutlined } from "@ant-design/icons";
import "./LoyaltyRedemption.css";

const LoyaltyRedemption = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("Failed to fetch customers");
    }
  };

  const handleRedeemClick = (customer) => {
    setSelectedCustomer(customer);
    setPointsToRedeem("");
    setIsModalVisible(true);
  };

  const handleRedeem = async () => {
    if (!pointsToRedeem || pointsToRedeem <= 0) {
      message.error("Please enter valid points to redeem");
      return;
    }

    if (pointsToRedeem < 50) {
      message.error("Minimum 50 points required for redemption");
      return;
    }

    if (pointsToRedeem > selectedCustomer.loyaltyPoints) {
      message.error(`Insufficient points. Available: ${selectedCustomer.loyaltyPoints}`);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/customers/${selectedCustomer._id}/redeem-points`,
        { pointsToRedeem: parseInt(pointsToRedeem) }
      );

      message.success(response.data.message);
      setIsModalVisible(false);
      fetchCustomers(); // Refresh customer list
    } catch (error) {
      console.error("Error redeeming points:", error);
      message.error(error.response?.data?.error || "Failed to redeem points");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerContact?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customersWithPoints = filteredCustomers.filter(customer => customer.loyaltyPoints > 0);

  return (
    <div className="loyalty-redemption-container">
      <h2>Loyalty Points Redemption</h2>
      
      <div className="search-section">
        <Input
          placeholder="Search customers by name, contact, or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: 16 }}
        />
      </div>

      <div className="redemption-rules">
        <Card title="Redemption Rules" style={{ marginBottom: 16 }}>
          <ul>
            <li>₹100 spent = 1 loyalty point earned</li>
            <li>Minimum 50 points required for redemption</li>
            <li>1 point = ₹1 redemption value</li>
            <li>Points can only be redeemed in full amounts</li>
          </ul>
        </Card>
      </div>

      <div className="customers-grid">
        {customersWithPoints.map((customer) => (
          <Card
            key={customer._id}
            title={customer.customerName}
            className="customer-card"
            extra={
              <Button
                type="primary"
                icon={<GiftOutlined />}
                onClick={() => handleRedeemClick(customer)}
                disabled={customer.loyaltyPoints < 50}
              >
                Redeem
              </Button>
            }
          >
            <div className="customer-info">
              <p><strong>Contact:</strong> {customer.customerContact}</p>
              {customer.email && <p><strong>Email:</strong> {customer.email}</p>}
              <Statistic
                title="Loyalty Points"
                value={customer.loyaltyPoints}
                prefix={<DollarOutlined />}
                suffix="pts"
                valueStyle={{ color: customer.loyaltyPoints >= 50 ? '#3f8600' : '#cf1322' }}
              />
              {customer.loyaltyPoints >= 50 && (
                <p className="redemption-value">
                  <strong>Redemption Value:</strong> ₹{customer.loyaltyPoints}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {customersWithPoints.length === 0 && (
        <div className="no-customers">
          <p>No customers with loyalty points found.</p>
        </div>
      )}

      <Modal
        title="Redeem Loyalty Points"
        open={isModalVisible}
        onOk={handleRedeem}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
        okText="Redeem"
        cancelText="Cancel"
      >
        {selectedCustomer && (
          <div>
            <p><strong>Customer:</strong> {selectedCustomer.customerName}</p>
            <p><strong>Available Points:</strong> {selectedCustomer.loyaltyPoints}</p>
            <p><strong>Redemption Value:</strong> ₹{selectedCustomer.loyaltyPoints}</p>
            
            <div style={{ marginTop: 16 }}>
              <label>Points to Redeem (min 50):</label>
              <Input
                type="number"
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(e.target.value)}
                placeholder="Enter points to redeem"
                min="50"
                max={selectedCustomer.loyaltyPoints}
                style={{ marginTop: 8 }}
              />
            </div>
            
            {pointsToRedeem && (
              <div style={{ marginTop: 16 }}>
                <p><strong>Redemption Value:</strong> ₹{parseInt(pointsToRedeem) || 0}</p>
                <p><strong>Remaining Points:</strong> {selectedCustomer.loyaltyPoints - (parseInt(pointsToRedeem) || 0)}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoyaltyRedemption; 
