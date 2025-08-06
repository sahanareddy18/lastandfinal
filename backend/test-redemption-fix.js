import axios from 'axios';

const testRedemptionFix = async () => {
  console.log('🧪 Testing Loyalty Points Redemption Fix...');
  
  try {
    // First, let's check if there are customers with loyalty points
    console.log('📋 Checking customers with loyalty points...');
    const customersResponse = await axios.get('http://localhost:5000/api/customers');
    const customers = customersResponse.data;
    
    const customersWithPoints = customers.filter(c => c.loyaltyPoints >= 50);
    
    if (customersWithPoints.length === 0) {
      console.log('❌ No customers found with 50+ loyalty points');
      console.log('💡 Available customers:');
      customers.forEach(c => {
        console.log(`  - ${c.customerName}: ${c.loyaltyPoints} points`);
      });
      return;
    }
    
    const testCustomer = customersWithPoints[0];
    console.log(`✅ Found customer: ${testCustomer.customerName} with ${testCustomer.loyaltyPoints} points`);
    
    // Get available stock
    console.log('📦 Getting available stock...');
    const stockResponse = await axios.get('http://localhost:5000/api/stocks');
    const stockItems = stockResponse.data.data;
    
    if (stockItems.length === 0) {
      console.log('❌ No stock available for testing');
      return;
    }
    
    const stockItem = stockItems[0];
    console.log(`✅ Using stock item: ${stockItem.productName}`);
    
    // Calculate test sale
    const quantity = 2;
    const mrp = stockItem.mrp;
    const originalAmount = mrp * quantity;
    const pointsToRedeem = Math.min(50, testCustomer.loyaltyPoints);
    const finalAmount = originalAmount - pointsToRedeem;
    
    console.log(`💰 Original sale amount: ₹${originalAmount}`);
    console.log(`🎁 Points to redeem: ${pointsToRedeem}`);
    console.log(`💰 Final amount after redemption: ₹${finalAmount}`);
    console.log(`📊 Customer points before: ${testCustomer.loyaltyPoints}`);
    
    // Create test sale with redemption
    const saleData = {
      customer: {
        name: testCustomer.customerName,
        contact: testCustomer.customerContact,
        email: testCustomer.email || ''
      },
      items: [{
        productName: stockItem.productName,
        batchId: stockItem.batchId,
        packing: stockItem.packing,
        quantity: quantity,
        mrp: mrp,
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
    
    console.log('🛒 Creating test sale with redemption...');
    const saleResponse = await axios.post('http://localhost:5000/api/sales', saleData);
    console.log('✅ Sale created successfully:', saleResponse.data.message);
    
    // Check customer points after redemption
    console.log('🔍 Checking customer points after redemption...');
    const updatedCustomersResponse = await axios.get('http://localhost:5000/api/customers');
    const updatedCustomers = updatedCustomersResponse.data;
    const updatedCustomer = updatedCustomers.find(c => c.customerContact === testCustomer.customerContact);
    
    if (updatedCustomer) {
      console.log(`📊 Customer points after: ${updatedCustomer.loyaltyPoints}`);
      const expectedPoints = testCustomer.loyaltyPoints - pointsToRedeem + Math.floor(originalAmount / 100);
      console.log(`🎯 Expected points: ${expectedPoints}`);
      
      if (updatedCustomer.loyaltyPoints === expectedPoints) {
        console.log('✅ Loyalty points redemption working correctly!');
      } else {
        console.log('❌ Loyalty points redemption not working as expected');
        console.log(`   Expected: ${expectedPoints}, Got: ${updatedCustomer.loyaltyPoints}`);
      }
    } else {
      console.log('❌ Could not find updated customer');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testRedemptionFix(); 