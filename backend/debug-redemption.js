import axios from 'axios';

const debugRedemption = async () => {
  console.log('🔍 Debugging Loyalty Points Redemption...');
  
  try {
    // Check if server is running
    console.log('🌐 Testing server connection...');
    const customersResponse = await axios.get('http://localhost:5000/api/customers');
    console.log('✅ Server is running');
    
    const customers = customersResponse.data;
    console.log(`📋 Found ${customers.length} customers:`);
    customers.forEach(c => {
      console.log(`  - ${c.customerName}: ${c.loyaltyPoints} points`);
    });
    
    // Find a customer with points
    const customerWithPoints = customers.find(c => c.loyaltyPoints > 0);
    if (!customerWithPoints) {
      console.log('❌ No customers with loyalty points found');
      return;
    }
    
    console.log(`✅ Using customer: ${customerWithPoints.customerName} with ${customerWithPoints.loyaltyPoints} points`);
    
    // Get stock
    const stockResponse = await axios.get('http://localhost:5000/api/stocks');
    const stockItems = stockResponse.data.data;
    
    if (stockItems.length === 0) {
      console.log('❌ No stock available');
      return;
    }
    
    const stockItem = stockItems[0];
    console.log(`✅ Using stock: ${stockItem.productName}`);
    
    // Test with redemption
    const pointsToRedeem = Math.min(50, customerWithPoints.loyaltyPoints);
    const originalAmount = stockItem.mrp * 2;
    const finalAmount = originalAmount - pointsToRedeem;
    
    console.log(`💰 Test sale: Original ₹${originalAmount}, Redeem ${pointsToRedeem} points, Final ₹${finalAmount}`);
    
    const saleData = {
      customer: {
        name: customerWithPoints.customerName,
        contact: customerWithPoints.customerContact,
        email: customerWithPoints.email || ''
      },
      items: [{
        productName: stockItem.productName,
        batchId: stockItem.batchId,
        packing: stockItem.packing,
        quantity: 2,
        mrp: stockItem.mrp,
        gst: stockItem.gst || 0,
        discount: 0,
        expiryDate: stockItem.expiryDate,
        total: originalAmount
      }],
      paymentType: 'Cash',
      totalAmount: finalAmount,
      totalDiscount: pointsToRedeem,
      redeemedPoints: pointsToRedeem
    };
    
    console.log('🛒 Creating sale with redemption...');
    console.log('📤 Sale data:', JSON.stringify(saleData, null, 2));
    
    const saleResponse = await axios.post('http://localhost:5000/api/sales', saleData);
    console.log('✅ Sale created:', saleResponse.data.message);
    
    // Check customer points after
    const updatedCustomersResponse = await axios.get('http://localhost:5000/api/customers');
    const updatedCustomers = updatedCustomersResponse.data;
    const updatedCustomer = updatedCustomers.find(c => c.customerContact === customerWithPoints.customerContact);
    
    if (updatedCustomer) {
      console.log(`📊 Customer points after: ${updatedCustomer.loyaltyPoints}`);
      const expectedPoints = customerWithPoints.loyaltyPoints - pointsToRedeem + Math.floor(originalAmount / 100);
      console.log(`🎯 Expected points: ${expectedPoints}`);
      
      if (updatedCustomer.loyaltyPoints === expectedPoints) {
        console.log('✅ Redemption working correctly!');
      } else {
        console.log('❌ Redemption not working correctly');
        console.log(`   Expected: ${expectedPoints}, Got: ${updatedCustomer.loyaltyPoints}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
};

debugRedemption(); 