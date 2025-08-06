import axios from 'axios';

const testRedemption = async () => {
  console.log('🧪 Simple Redemption Test...');
  
  try {
    // Get customers
    const customersResponse = await axios.get('http://localhost:5000/api/customers');
    const customers = customersResponse.data;
    
    console.log('📋 Available customers:');
    customers.forEach(c => {
      console.log(`  - ${c.customerName}: ${c.loyaltyPoints} points`);
    });
    
    // Find customer with points
    const customer = customers.find(c => c.loyaltyPoints >= 50);
    if (!customer) {
      console.log('❌ No customer with 50+ points found');
      return;
    }
    
    console.log(`✅ Testing with customer: ${customer.customerName} (${customer.loyaltyPoints} points)`);
    
    // Get stock
    const stockResponse = await axios.get('http://localhost:5000/api/stocks');
    const stockItems = stockResponse.data.data;
    
    if (stockItems.length === 0) {
      console.log('❌ No stock available');
      return;
    }
    
    const stockItem = stockItems[0];
    console.log(`✅ Using stock: ${stockItem.productName} (₹${stockItem.mrp})`);
    
    // Create test sale with redemption
    const pointsToRedeem = 50;
    const originalAmount = stockItem.mrp * 2;
    const finalAmount = originalAmount - pointsToRedeem;
    
    console.log(`💰 Test: Original ₹${originalAmount}, Redeem ${pointsToRedeem} points, Final ₹${finalAmount}`);
    console.log(`📊 Customer points before: ${customer.loyaltyPoints}`);
    
    const saleData = {
      customer: {
        name: customer.customerName,
        contact: customer.customerContact,
        email: customer.email || ''
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
      redeemedPoints: pointsToRedeem  // This is the key parameter
    };
    
    console.log('🛒 Creating sale with redemption...');
    console.log('📤 redeemedPoints in request:', pointsToRedeem);
    
    const saleResponse = await axios.post('http://localhost:5000/api/sales', saleData);
    console.log('✅ Sale created successfully');
    
    // Check customer points after
    const updatedCustomersResponse = await axios.get('http://localhost:5000/api/customers');
    const updatedCustomers = updatedCustomersResponse.data;
    const updatedCustomer = updatedCustomers.find(c => c.customerContact === customer.customerContact);
    
    if (updatedCustomer) {
      console.log(`📊 Customer points after: ${updatedCustomer.loyaltyPoints}`);
      const expectedPoints = customer.loyaltyPoints - pointsToRedeem + Math.floor(originalAmount / 100);
      console.log(`🎯 Expected points: ${expectedPoints}`);
      
      if (updatedCustomer.loyaltyPoints === expectedPoints) {
        console.log('✅ Redemption working correctly!');
      } else {
        console.log('❌ Redemption not working correctly');
        console.log(`   Expected: ${expectedPoints}, Got: ${updatedCustomer.loyaltyPoints}`);
        console.log(`   Difference: ${updatedCustomer.loyaltyPoints - expectedPoints}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testRedemption(); 