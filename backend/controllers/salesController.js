import mongoose from 'mongoose';
import Sales from '../models/Sales.js';
import Stock from '../models/stockModel.js';
import Customer from '../models/customerModel.js';

// Create new sale
export const createSale = async (req, res) => {
    try {
      const { customer, items, paymentType = 'Cash', totalDiscount = 0, redeemedPoints = 0 } = req.body;
      
      // Debug: Log the received data
      console.log('🔍 Received sale data:');
      console.log('  - redeemedPoints:', redeemedPoints);
      console.log('  - totalDiscount:', totalDiscount);
      console.log('  - customer contact:', customer?.contact);
  
      // Validate required fields
      if (!customer || !customer.name || !customer.contact) {
        throw new Error('Customer name and contact are required');
      }
  
      if (!items || items.length === 0) {
        throw new Error('At least one sale item is required');
      }
  
      // Process items and calculate totals
      let subtotal = 0;
      let gstTotal =  0;
      const processedItems = [];
      const stockUpdates = [];
  
      for (const item of items) {
        // Validate item fields
        if (!item.productName || !item.batchId || !item.quantity || !item.mrp) {
          throw new Error('Product name, batch ID, quantity and MRP are required');
        }
  
        // Convert and validate numeric values
        const quantity = Number(item.quantity);
        const mrp = Number(item.mrp);
        const gst = Number(item.gst || 0);
        const discount = Number(item.discount || 0);
  
        if (isNaN(quantity) || quantity <= 0) throw new Error('Invalid quantity');
        if (isNaN(mrp) || mrp <= 0) throw new Error('Invalid MRP');
        if (isNaN(gst) || gst < 0) throw new Error('Invalid GST');
        if (isNaN(discount) || discount < 0) throw new Error('Invalid discount');
  
                 // Get all batches for this product, sorted by expiry (FEFO)
         const productBatches = await Stock.find({ 
           productName: item.productName,
           quantity: { $gt: 0 }
         })
           .sort({ expiryDate: 1 }); // Sort by nearest expiry first
  
        if (!productBatches.length) {
          throw new Error(`Product ${item.productName} not found in stock`);
        }
  
        // Find the specific batch being sold
        const stockItem = productBatches.find(b => b.batchId === item.batchId);
        if (!stockItem) {
          throw new Error(`Batch ${item.batchId} not available for ${item.productName}`);
        }
  
        if (stockItem.quantity < quantity) {
          throw new Error(`Only ${stockItem.quantity} available for ${item.productName} (Batch: ${item.batchId})`);
        }
  
        // Calculate item totals
        const priceAfterDiscount = mrp - discount;
        const totalAfterDiscount = priceAfterDiscount * quantity;
        const itemGst = totalAfterDiscount * (gst / 100);
        const itemTotal = totalAfterDiscount + itemGst;
  
        subtotal += mrp * quantity;
        gstTotal += itemGst;
  
        // Prepare stock update
        stockUpdates.push({
          updateOne: {
            filter: { 
              productName: item.productName,
              batchId: item.batchId 
            },
            update: { $inc: { quantity: -quantity } }
          }
        });
  
        // Prepare sale item
        processedItems.push({
          productName: item.productName,
          batchId: item.batchId,
          packing: stockItem.packing,
          quantity,
          mrp,
          gst,
          discount,
          expiryDate: stockItem.expiryDate,
          total: itemTotal
        });
      }
  
      // Validate discount
      if (totalDiscount > subtotal) {
        throw new Error('Total discount cannot exceed subtotal');
      }
  
      // Calculate final totals
      const totalAmount = subtotal - totalDiscount + gstTotal;
  
      // Create sale record
      const sale = new Sales({
        customer: {
          name: customer.name,
          contact: customer.contact,
          ...(customer.email && { email: customer.email })
        },
        items: processedItems,
        paymentType,
        subtotal: parseFloat(subtotal.toFixed(2)),
        totalDiscount: parseFloat(totalDiscount.toFixed(2)),
        gstTotal: parseFloat(gstTotal.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2))
      });
  
      // Execute all operations
      await sale.save();
      if (stockUpdates.length > 0) {
        await Stock.bulkWrite(stockUpdates);
      }

      // Calculate loyalty points based on amount BEFORE redemption
      // The totalAmount sent from frontend already includes redemption discount
      // So we need to add back the redeemed points to get the original amount for loyalty calculation
      const originalAmountForLoyalty = totalAmount + redeemedPoints;
      const loyaltyPointsEarned = Math.floor(originalAmountForLoyalty / 100);
      console.log(`💰 Original sale amount: ₹${originalAmountForLoyalty}, Final amount: ₹${totalAmount}, Loyalty points earned: ${loyaltyPointsEarned}`);
      
      // Handle loyalty points redemption if any
      if (redeemedPoints > 0) {
        console.log(`🎁 Processing loyalty points redemption: ${redeemedPoints} points`);
        
        let customerToUpdate = await Customer.findOne({ customerContact: customer.contact });
        if (!customerToUpdate) {
          throw new Error('Customer not found for loyalty points redemption');
        }
        
        if (customerToUpdate.loyaltyPoints < redeemedPoints) {
          throw new Error(`Insufficient loyalty points. Available: ${customerToUpdate.loyaltyPoints}, Requested: ${redeemedPoints}`);
        }
        
        console.log(`📊 Customer: ${customerToUpdate.customerName}, Current points: ${customerToUpdate.loyaltyPoints}`);
        customerToUpdate.loyaltyPoints -= redeemedPoints;
        await customerToUpdate.save();
        console.log(`✅ Loyalty points redeemed. Remaining points: ${customerToUpdate.loyaltyPoints}`);
      } else {
        console.log('ℹ️ No redemption points to process');
      }
      
      if (loyaltyPointsEarned > 0) {
        // Find and update customer's loyalty points
        let customerToUpdate = await Customer.findOne({ customerContact: customer.contact });
        console.log(`🔍 Looking for customer with contact: ${customer.contact}`);
        console.log(`🔍 Customer found: ${customerToUpdate ? 'Yes' : 'No'}`);
        
        if (customerToUpdate) {
          console.log(`📊 Customer: ${customerToUpdate.customerName}, Current points: ${customerToUpdate.loyaltyPoints}`);
          customerToUpdate.loyaltyPoints += loyaltyPointsEarned;
          await customerToUpdate.save();
          console.log(`✅ Loyalty points updated to: ${customerToUpdate.loyaltyPoints}`);
        } else {
          console.log(`❌ Customer not found in database for contact: ${customer.contact}`);
          console.log(`💡 Creating new customer automatically...`);
          
          // Create new customer automatically
          const newCustomer = new Customer({
            customerName: customer.name,
            customerContact: customer.contact,
            email: customer.email || '',
            loyaltyPoints: loyaltyPointsEarned
          });
          await newCustomer.save();
          console.log(`✅ New customer created: ${newCustomer.customerName} with ${loyaltyPointsEarned} loyalty points`);
        }
      }

      res.status(201).json({
        success: true,
        data: sale,
        message: 'Sale completed successfully'
      });
  
    } catch (error) {
      console.error('Sale creation error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to process sale'
      });
    }
};
// Get all sales with pagination
export const getAllSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.contact': { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const sales = await Sales.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const count = await Sales.countDocuments(query);

    res.json({
      success: true,
      data: sales,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales'
    });
  }
};

// Get sale details by ID
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id).lean();
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }
    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sale details'
    });
  }
};

// Update sale
export const updateSale = async (req, res) => {
  try {
    const updatedSale = await Sales.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    res.json({ success: true, data: updatedSale });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete sale
export const deleteSale = async (req, res) => {
  try {
    const deletedSale = await Sales.findByIdAndDelete(req.params.id);
    if (!deletedSale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Search product suggestions
export const searchProductSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }

    const suggestions = await Stock.aggregate([
      {
        $match: {
          $and: [
            { quantity: { $gt: 0 } },
            {
              $or: [
                { productName: { $regex: query, $options: 'i' } },
                { batchId: { $regex: query, $options: 'i' } }
              ]
            }
          ]
        }
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          label: { $concat: ['$productName', ' - ', '$packing', ' (Batch: ', '$batchId', ')'] },
          productName: 1,
          packing: 1,
          batchId: 1,
          mrp: 1,
          rate: 1,
          gst: 1,
          quantity: 1,
          expiryDate: 1
        }
      },
      { $limit: 10 }
    ]);

    res.json(suggestions);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions'
    });
  }
};

// Generate sales report
export const generateSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    const dateFormat = {
      day: '%Y-%m-%d',
      month: '%Y-%m',
      year: '%Y'
    }[groupBy] || '%Y-%m-%d';

    const report = await Sales.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: '$date'
            }
          },
          totalSales: { $sum: '$totalAmount' },
          totalItems: { $sum: { $size: '$items' } },
          totalDiscount: { $sum: '$totalDiscount' },
          totalGST: { $sum: '$gstTotal' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: '$_id',
          totalSales: 1,
          totalItems: 1,
          totalDiscount: 1,
          totalGST: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: report,
      parameters: {
        startDate,
        endDate,
        groupBy
      }
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate report'
    });
  }
};
// Replace all the individual exports at the bottom of your file with:
export default {
    createSale,
    getAllSales,
    getSaleById,
    updateSale,
    deleteSale,
    searchProductSuggestions,
    generateSalesReport
  };