import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import './InvoicePage.css';
import AddCustomer from './AddCustomer';

const formatCurrency = (value) => {
  const num = Number(value);
  return isNaN(num) ? '₹0.00' : `₹${num.toFixed(2)}`;
};

// Utility function to check if product qualifies for expiry discount
const checkExpiryDiscount = (expiryDate, mrp) => {
  if (!expiryDate || expiryDate === 'N/A') return { qualifies: false, discount: 0 };
  
  const today = new Date();
  const expiry = new Date(expiryDate);
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  
  // Check if expiry is within 3 months and not expired
  if (expiry <= threeMonthsFromNow && expiry > today) {
    const discountPercentage = 20;
    const discountAmount = (mrp * discountPercentage) / 100;
    return {
      qualifies: true,
      discount: Math.round(discountAmount * 100) / 100,
      discountPercentage
    };
  }
  
  return { qualifies: false, discount: 0 };
};

const InvoicePage = () => {
  const [invoice, setInvoice] = useState({
    number: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString().split('T')[0],
    paymentType: 'Cash',
    subtotal: 0,
    gstTotal: 0,
    totalAmount: 0,
    totalDiscount: 0,
  });

  const [customer, setCustomer] = useState({
    name: '',
    contact: '',
    email: '',
    loyaltyPoints: 0,
  });

  // Loyalty points redemption state
  const [loyaltyRedemption, setLoyaltyRedemption] = useState({
    showRedemption: false,
    pointsToRedeem: 0,
    redemptionAmount: 0,
    maxRedeemablePoints: 0,
  });

  // Store the actual redeemed points that will be sent to backend
  const [actualRedeemedPoints, setActualRedeemedPoints] = useState(0);

  const [items, setItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [notification, setNotification] = useState('');

  // Fetch stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const { data } = await axios.get('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/stocks');
        const formattedData = data.data.map(item => {
          // Check if this item qualifies for expiry discount
          const expiryDiscount = checkExpiryDiscount(item.expiryDate, item.mrp);
          
          return {
            ...item,
            quantity: Number(item.quantity) || 0,
            mrp: Number(item.mrp) || 0,
            gst: Number(item.gst) || 0,
            expiryDate: item.expiryDate || 'N/A',
            hasExpiryDiscount: expiryDiscount.qualifies,
            expiryDiscountAmount: expiryDiscount.discount,
            expiryDiscountPercentage: expiryDiscount.discountPercentage
          };
        });
        setStockData(formattedData || []);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setStockData([]);
      }
    };
    fetchStockData();
  }, []);

  // Fetch customer suggestions
  useEffect(() => {
    if (isSelected) {
      setIsSelected(false);
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      if (customer.contact.length >= 3 && customer.contact.length < 10) {
        fetchCustomerSuggestions(customer.contact);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customer.contact, isSelected]);

  const fetchCustomerSuggestions = async (query) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/customers/search', {
        params: { contact: query },
      });
      setSuggestions(data);
      setShowAddCustomer(data.length === 0);
    } catch (error) {
      console.error('Customer search failed:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addNewProductRow = () => {
    setItems([...items, { 
      productName: '', 
      batchId: '', 
      packing: '', 
      quantity: '', 
      discount: '',
      stockQuantity: '',
      expiryDate: '',
      mrp: '',
      gst: '',
      packingOptions: [],
      total: 0,
      newRow: true 
    }]);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    const currentItem = updatedItems[index];

    if (field === 'productName') {
      const productBatches = stockData.filter(item => item.productName === value);
      
      updatedItems[index] = {
        ...currentItem,
        productName: value,
        batchId: '',
        packing: '',
        stockQuantity: '',
        expiryDate: '',
        mrp: '',
        gst: '',
        packingOptions: [...new Set(productBatches.map(b => b.packing))],
        quantity: '',
        discount: '',
        total: 0
      };
    } 
    else if (field === 'batchId' && value) {
      const selectedBatch = stockData.find(item => 
        item.batchId === value && 
        item.productName === currentItem.productName
      );
      
      if (selectedBatch) {
        // Check if product qualifies for expiry discount
        const expiryDiscount = checkExpiryDiscount(selectedBatch.expiryDate, selectedBatch.mrp);
        
        updatedItems[index] = {
          ...currentItem,
          batchId: value,
          packing: selectedBatch.packing,
          stockQuantity: Number(selectedBatch.quantity) || 0,
          expiryDate: selectedBatch.expiryDate || 'N/A',
          mrp: Number(selectedBatch.mrp) || 0,
          gst: Number(selectedBatch.gst) || 0,
          packingOptions: [selectedBatch.packing],
          quantity: currentItem.quantity || '',
          discount: expiryDiscount.qualifies ? expiryDiscount.discount : (currentItem.discount || 0)
        };
        
        // Show notification if discount is applied
        if (expiryDiscount.qualifies) {
          setNotification(`⚠️ ${expiryDiscount.discountPercentage}% discount applied - Product expires within 3 months`);
          setTimeout(() => setNotification(''), 5000);
        }
      }
    }
    else if (field === 'packing' && value) {
      const matchingBatch = stockData.find(item => 
        item.productName === currentItem.productName && 
        item.packing === value
      );
      
      if (matchingBatch) {
        // Check if product qualifies for expiry discount
        const expiryDiscount = checkExpiryDiscount(matchingBatch.expiryDate, matchingBatch.mrp);
        
        updatedItems[index] = {
          ...currentItem,
          packing: value,
          batchId: matchingBatch.batchId,
          stockQuantity: Number(matchingBatch.quantity) || 0,
          expiryDate: matchingBatch.expiryDate || 'N/A',
          mrp: Number(matchingBatch.mrp) || 0,
          gst: Number(matchingBatch.gst) || 0,
          packingOptions: [matchingBatch.packing],
          discount: expiryDiscount.qualifies ? expiryDiscount.discount : (currentItem.discount || 0)
        };
        
        // Show notification if discount is applied
        if (expiryDiscount.qualifies) {
          setNotification(`⚠️ ${expiryDiscount.discountPercentage}% discount applied - Product expires within 3 months`);
          setTimeout(() => setNotification(''), 5000);
        }
      }
    }
    else {
      updatedItems[index][field] = field === 'quantity' || field === 'discount' 
        ? Number(value) || 0 
        : value;
    }

    if (['quantity', 'discount', 'mrp', 'gst', 'packing', 'batchId'].includes(field)) {
      updatedItems[index].total = calculateItemTotal(updatedItems[index]);
    }

    setItems(updatedItems);
    updateTotals(updatedItems);
  };

  const calculateItemTotal = (item) => {
    const mrp = Number(item.mrp) || 0;
    const quantity = Number(item.quantity) || 0;
    const discount = Number(item.discount) || 0;
    const gst = Number(item.gst) || 0;

    const priceAfterDiscount = mrp - discount;
    const totalAfterDiscount = priceAfterDiscount * quantity;
    const gstAmount = totalAfterDiscount * (gst / 100);
    
    return totalAfterDiscount + gstAmount;
  };

  const updateTotals = (items) => {
    const totals = items.reduce((acc, item) => {
      const mrp = Number(item.mrp) || 0;
      const quantity = Number(item.quantity) || 0;
      const discount = Number(item.discount) || 0;
      const gst = Number(item.gst) || 0;

      acc.subtotal += mrp * quantity;
      acc.totalDiscount += discount * quantity;
      acc.gstTotal += (mrp * quantity - discount * quantity) * (gst / 100);
      return acc;
    }, { subtotal: 0, totalDiscount: 0, gstTotal: 0 });

    setInvoice({
      ...invoice,
      subtotal: Number(totals.subtotal.toFixed(2)),
      totalDiscount: Number(totals.totalDiscount.toFixed(2)),
      gstTotal: Number(totals.gstTotal.toFixed(2)),
      totalAmount: Number((totals.subtotal - totals.totalDiscount + totals.gstTotal).toFixed(2)),
    });
  };

  const handleFinalizeSale = async () => {
    if (!customer.name || !customer.contact) {
      setNotification('Customer name and contact are required');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
  
    if (items.length === 0) {
      setNotification('At least one item is required');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
  
    const invalidItems = items.filter(item => {
      const quantity = Number(item.quantity);
      const mrp = Number(item.mrp);
      const total = calculateItemTotal(item);
      
      return (
        !item.productName || 
        !item.batchId || 
        isNaN(quantity) || 
        quantity <= 0 ||
        isNaN(mrp) ||
        mrp <= 0 ||
        isNaN(total) ||
        total <= 0
      );
    });
  
    if (invalidItems.length > 0) {
      setNotification('All items must have valid product details and positive values');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
  
    try {
      const calculatedTotals = items.reduce((acc, item) => {
        const quantity = Number(item.quantity);
        const mrp = Number(item.mrp);
        const discount = Number(item.discount || 0);
        const gst = Number(item.gst || 0);
        const itemTotal = calculateItemTotal(item);

        acc.subtotal += mrp * quantity;
        acc.totalDiscount += discount * quantity;
        acc.gstTotal += (mrp * quantity - discount * quantity) * (gst / 100);
        return acc;
      }, { subtotal: 0, totalDiscount: 0, gstTotal: 0 });

      // Use the invoice totalAmount which includes redemption discount
      const totalAmount = invoice.totalAmount;

      const saleData = {
        customer,
        items: items.map((item) => ({
          productName: item.productName,
          batchId: item.batchId,
          packing: item.packing,
          quantity: Number(item.quantity),
          mrp: Number(item.mrp),
          gst: Number(item.gst || 0),
          discount: Number(item.discount || 0),
          expiryDate: item.expiryDate,
          total: calculateItemTotal(item)
        })),
        paymentType: invoice.paymentType,
        subtotal: Number(calculatedTotals.subtotal.toFixed(2)),
        totalDiscount: Number(invoice.totalDiscount.toFixed(2)), // Use invoice totalDiscount which includes redemption
        gstTotal: Number(calculatedTotals.gstTotal.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
        redeemedPoints: actualRedeemedPoints || 0
      };

      await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/sales', saleData);
      
      setNotification('Sale completed successfully!');
      setTimeout(() => setNotification(''), 3000);
      
      // Reset form
      setItems([]);
      setCustomer({ name: '', contact: '', email: '', loyaltyPoints: 0 });
      setInvoice({
        number: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString().split('T')[0],
        paymentType: 'Cash',
        subtotal: 0,
        gstTotal: 0,
        totalAmount: 0,
        totalDiscount: 0,
      });
      setLoyaltyRedemption({
        showRedemption: false,
        pointsToRedeem: 0,
        redemptionAmount: 0,
        maxRedeemablePoints: 0,
      });
      setActualRedeemedPoints(0);

    } catch (error) {
      console.error('Sale creation failed:', error.response?.data || error.message);
      setNotification(`Error: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setNotification(''), 5000);
    }
  };

  const handleCustomerChange = (e) => {
    setIsSelected(false);
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSuggestionClick = (customer) => {
    setCustomer({
      contact: customer.customerContact,
      name: customer.customerName,
      email: customer.email || '',
      loyaltyPoints: customer.loyaltyPoints || 0,
    });
    setSuggestions([]);
    setIsSelected(true);
    
    // Update loyalty redemption max points
    setLoyaltyRedemption(prev => ({
      ...prev,
      maxRedeemablePoints: customer.loyaltyPoints || 0,
    }));
  };

  // Loyalty points redemption functions
  const handleLoyaltyRedemption = () => {
    if (customer.loyaltyPoints >= 50) {
      setLoyaltyRedemption(prev => ({
        ...prev,
        showRedemption: true,
        maxRedeemablePoints: customer.loyaltyPoints,
      }));
    } else {
      setNotification('Minimum 50 loyalty points required for redemption');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleRedeemPoints = () => {
    const pointsToRedeem = loyaltyRedemption.pointsToRedeem;
    
    if (pointsToRedeem < 50) {
      setNotification('Minimum 50 points required for redemption');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
    
    if (pointsToRedeem > customer.loyaltyPoints) {
      setNotification('Insufficient loyalty points');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    // Apply redemption to invoice
    const redemptionAmount = pointsToRedeem; // 1 point = ₹1
    const newTotalAmount = Math.max(0, invoice.totalAmount - redemptionAmount);
    
    setInvoice(prev => ({
      ...prev,
      totalAmount: newTotalAmount,
      totalDiscount: prev.totalDiscount + redemptionAmount,
    }));

    // Update customer loyalty points
    setCustomer(prev => ({
      ...prev,
      loyaltyPoints: prev.loyaltyPoints - pointsToRedeem,
    }));

    // Store the redeemed points for backend
    setActualRedeemedPoints(pointsToRedeem);

    setNotification(`Successfully redeemed ${pointsToRedeem} points for ₹${redemptionAmount}`);
    setTimeout(() => setNotification(''), 3000);

    // Close redemption modal
    setLoyaltyRedemption(prev => ({
      ...prev,
      showRedemption: false,
      pointsToRedeem: 0,
      redemptionAmount: 0,
    }));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .invoice-header { border-bottom: 2px solid #000; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .totals { margin-top: 30px; float: right; width: 300px; }
            .totals div { display: flex; justify-content: space-between; margin: 10px 0; }
            .grand-total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>Invoice #${invoice.number}</h1>
            <p>Date: ${new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          <div class="customer-details">
            <h3>Customer Information</h3>
            <p>Name: ${customer.name}</p>
            <p>Contact: ${customer.contact}</p>
            ${customer.email ? `<p>Email: ${customer.email}</p>` : ''}
            ${customer.loyaltyPoints ? `<p>Loyalty Points: ${customer.loyaltyPoints} points (₹${customer.loyaltyPoints} value)</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Packing</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Discount</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item) => `
                <tr>
                  <td>${item.productName || ''}</td>
                  <td>${item.packing || ''}</td>
                  <td>${item.batchId || ''}</td>
                  <td>${item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</td>
                  <td>${formatCurrency(item.mrp)}</td>
                  <td>${item.quantity || 0}</td>
                  <td>${formatCurrency(item.discount)}</td>
                  <td>${item.gst ? `${Number(item.gst)}%` : '0%'}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="totals">
            <div>
              <span>Subtotal:</span>
              <span>${formatCurrency(invoice.subtotal)}</span>
            </div>
            <div>
              <span>Total Discount:</span>
              <span>${formatCurrency(invoice.totalDiscount)}</span>
            </div>
            <div>
              <span>GST Total:</span>
              <span>${formatCurrency(invoice.gstTotal)}</span>
            </div>
            <div class="grand-total">
              <span>Grand Total:</span>
              <span>${formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const generateQRCode = () => {
    const paymentUrl = `upi://pay?pa=your-upi-id@upi&pn=Your%20Business&mc=&tid=&tr=${invoice.number}&tn=Invoice%20Payment&am=${invoice.totalAmount}&cu=INR`;
    setQrCode(paymentUrl);
  };

  return (
    <div className="invoice-container">
      <h2>New Invoice</h2>

      {notification && <div className="notification">{notification}</div>}

      <div className="horizontal-form">
        <div className="input-group">
          <label>Contact Number</label>
          <input
            type="text"
            name="contact"
            value={customer.contact}
            onChange={(e) => {
              setIsSelected(false);
              setCustomer((prev) => ({ ...prev, contact: e.target.value }));
            }}
            placeholder="Start typing..."
            autoComplete="off"
          />
          {isLoading && <div className="spinner">Loading...</div>}
          {suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((customer) => (
                <li key={customer._id} onClick={() => handleSuggestionClick(customer)}>
                  {customer.customerContact} - {customer.customerName}
                </li>
              ))}
            </ul>
          )}
          {showAddCustomer && (
            <button className="add-customer-button" onClick={() => setIsModalOpen(true)}>
              Add Customer
            </button>
          )}
        </div>
        <div className="input-group">
          <label>Customer Name</label>
          <input type="text" name="name" value={customer.name} onChange={handleCustomerChange} />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" name="email" value={customer.email} onChange={handleCustomerChange} />
        </div>
        {customer.loyaltyPoints > 0 && (
          <div className="input-group">
            <label>Loyalty Points</label>
            <div className="loyalty-points-display">
              <span>{customer.loyaltyPoints} points (₹{customer.loyaltyPoints} value)</span>
              {customer.loyaltyPoints >= 50 && (
                <button 
                  type="button" 
                  className="redeem-button"
                  onClick={handleLoyaltyRedemption}
                >
                  Redeem Points
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="product-section">
        <h3>Add Products</h3>
        <button className="add-product-btn" onClick={addNewProductRow}>
          Add Product
        </button>
      </div>

      <div className="items-table">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Batch ID</th>
              <th>Packing</th>
              <th>Available Qty</th>
              <th>Expiry</th>
              <th>Quantity</th>
              <th>MRP</th>
              <th>GST</th>
              <th>Discount (₹)</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={item.productName}
                    onChange={(e) => updateItem(index, 'productName', e.target.value)}
                    list={`product-options-${index}`}
                  />
                  <datalist id={`product-options-${index}`}>
                    {[...new Set(stockData.map(s => s.productName))].map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </td>
                <td>
                  <select
                    value={item.batchId}
                    onChange={(e) => updateItem(index, 'batchId', e.target.value)}
                    disabled={!item.productName}
                  >
                    <option value="">Select Batch</option>
                    {stockData
                      .filter(stock => stock.productName === item.productName)
                      .map((batch) => (
                        <option key={batch.batchId} value={batch.batchId}>
                          {batch.batchId} (Exp: {new Date(batch.expiryDate).toLocaleDateString()})
                          {batch.hasExpiryDiscount ? ` - ${batch.expiryDiscountPercentage}% OFF` : ''}
                        </option>
                      ))}
                  </select>
                </td>
                <td>
                  <select
                    value={item.packing}
                    onChange={(e) => updateItem(index, 'packing', e.target.value)}
                    disabled={!item.productName}
                  >
                    <option value="">Select Packing</option>
                    {item.packingOptions?.map((pack) => (
                      <option key={pack} value={pack}>{pack}</option>
                    ))}
                  </select>
                </td>
                <td>{item.stockQuantity || 0}</td>
                <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max={item.stockQuantity || 0}
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    disabled={!item.batchId}
                  />
                </td>
                <td>{formatCurrency(item.mrp)}</td>
                <td>{item.gst ? `${Number(item.gst)}%` : '0%'}</td>
                <td>
                  <div className="discount-input-container">
                    <input
                      type="number"
                      min="0"
                      value={item.discount || 0}
                      onChange={(e) => updateItem(index, 'discount', e.target.value)}
                      className={item.discount > 0 ? 'discount-applied' : ''}
                    />
                    {item.discount > 0 && (
                      <span className="discount-indicator" title="Auto-applied expiry discount">
                        ⚠️
                      </span>
                    )}
                  </div>
                </td>
                <td>{formatCurrency(item.total)}</td>
                <td>
                  <button onClick={() => setItems(items.filter((_, i) => i !== index))}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="totals-section">
        <div className="total-row">
          <span>Subtotal:</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className="total-row">
          <span>Total Discount:</span>
          <span>{formatCurrency(invoice.totalDiscount)}</span>
        </div>
        <div className="total-row">
          <span>GST Total:</span>
          <span>{formatCurrency(invoice.gstTotal)}</span>
        </div>
        <div className="total-row grand-total">
          <span>Grand Total:</span>
          <span>{formatCurrency(invoice.totalAmount)}</span>
        </div>
      </div>

      <div className="horizontal-form">
        <div className="input-group">
          <label>Invoice Number</label>
          <input type="text" value={invoice.number} readOnly />
        </div>
        <div className="input-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={invoice.date}
            onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
          />
        </div>
        <div className="input-group payment-type">
          <label>Payment Type</label>
          <select
            name="paymentType"
            value={invoice.paymentType}
            onChange={(e) => setInvoice({ ...invoice, paymentType: e.target.value })}
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Online">Online</option>
          </select>
        </div>
      </div>

     

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={handleFinalizeSale} className="btn-primary">
          Finalize Sale
        </button>
        <button onClick={handlePrint} className="btn-secondary">
          Print Invoice
        </button>
        <button onClick={generateQRCode} className="btn-tertiary">
          Generate UPI QR
        </button>
      </div>

      {/* QR Code Display */}
      {qrCode && (
        <div className="qr-container">
          <h3>Scan to Pay</h3>
          <QRCodeCanvas value={qrCode} size={200} />
        </div>
      )}

      {/* Notifications */}
      {notification && <div className="notification">{notification}</div>}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AddCustomer onClose={() => setIsModalOpen(false)} />
            <button className="close-button" onClick={() => setIsModalOpen(false)}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loyalty Points Redemption Modal */}
      {loyaltyRedemption.showRedemption && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Redeem Loyalty Points</h3>
            <div className="redemption-form">
              <div className="input-group">
                <label>Available Points: {customer.loyaltyPoints}</label>
                <label>Minimum Redemption: 50 points</label>
                <label>Redemption Rate: 1 point = ₹1</label>
              </div>
              <div className="input-group">
                <label>Points to Redeem:</label>
                <input
                  type="number"
                  min="50"
                  max={customer.loyaltyPoints}
                  value={loyaltyRedemption.pointsToRedeem}
                  onChange={(e) => {
                    const points = parseInt(e.target.value) || 0;
                    setLoyaltyRedemption(prev => ({
                      ...prev,
                      pointsToRedeem: points,
                      redemptionAmount: points
                    }));
                  }}
                  placeholder="Enter points to redeem"
                />
              </div>
              <div className="redemption-summary">
                <p>Redemption Amount: ₹{loyaltyRedemption.redemptionAmount}</p>
                <p>New Total: ₹{Math.max(0, invoice.totalAmount - loyaltyRedemption.redemptionAmount)}</p>
              </div>
              <div className="modal-buttons">
                <button 
                  className="btn-primary" 
                  onClick={handleRedeemPoints}
                  disabled={loyaltyRedemption.pointsToRedeem < 50}
                >
                  Redeem Points
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => setLoyaltyRedemption(prev => ({ ...prev, showRedemption: false }))}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;
