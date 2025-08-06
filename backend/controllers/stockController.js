// controllers/stockController.js
import Stock from '../models/stockModel.js';

// Utility function to calculate discount for products nearing expiry
const calculateDiscount = (expiryDate, mrp) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  
  // Check if expiry is within 3 months
  if (expiry <= threeMonthsFromNow && expiry > today) {
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    const monthsUntilExpiry = daysUntilExpiry / 30;
    
    // Apply 20% discount for products expiring within 3 months
    const discountPercentage = 20;
    const discountAmount = (mrp * discountPercentage) / 100;
    const discountedPrice = mrp - discountAmount;
    
    return {
      discount: discountPercentage,
      discountedPrice: Math.round(discountedPrice * 100) / 100, // Round to 2 decimal places
      daysUntilExpiry,
      monthsUntilExpiry: Math.round(monthsUntilExpiry * 10) / 10
    };
  }
  
  return {
    discount: 0,
    discountedPrice: mrp,
    daysUntilExpiry: null,
    monthsUntilExpiry: null
  };
};

export const addStockFromPurchase = async (req, res) => {
  try {
    const { products, supplierName } = req.body;
    const newStockItems = [];

    for (const product of products) {
      const existingStock = await Stock.findOne({
        productName: product.productName,
        batchId: product.batchId
      });

      if (existingStock) {
        existingStock.quantity += Number(product.quantity);
        await existingStock.save();
        newStockItems.push(existingStock);
      } else {
        const newStock = new Stock({
          ...product,
          supplierName,
          quantity: Number(product.quantity),
          rate: Number(product.rate),
          gst: Number(product.gst),
          mrp: Number(product.mrp)
        });
        await newStock.save();
        newStockItems.push(newStock);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Stock added successfully',
      data: newStockItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add stock',
      error: error.message
    });
  }
};

export const getAllStock = async (req, res) => {
  try {
    const stock = await Stock.find();
    const stockWithDiscounts = await Promise.all(stock.map(async item => {
      const discountInfo = calculateDiscount(item.expiryDate, item.mrp);
      return {
        ...item.toObject(),
        discount: discountInfo.discount,
        discountedPrice: discountInfo.discountedPrice,
        daysUntilExpiry: discountInfo.daysUntilExpiry,
        monthsUntilExpiry: discountInfo.monthsUntilExpiry
      };
    }));

    res.status(200).json({
      success: true,
      data: stockWithDiscounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock',
      error: error.message
    });
  }
};

export const updateStock = async (req, res) => {
  try {
    const updatedStock = await Stock.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStock) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: updatedStock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

export const deleteStock = async (req, res) => {
  try {
    const deletedStock = await Stock.findByIdAndDelete(req.params.id);

    if (!deletedStock) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stock deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete stock',
      error: error.message
    });
  }
};

export const getRackManagement = async (req, res) => {
  try {
    // Get all stock items sorted by rack and shelf
    const stockItems = await Stock.find().sort({ rackNumber: 1, shelfNumber: 1, productName: 1 });
    
    // Group items by rack and shelf
    const rackData = {};
    stockItems.forEach(item => {
      const locationKey = `${item.rackNumber}-${item.shelfNumber}`;
      if (!rackData[locationKey]) {
        rackData[locationKey] = {
          rackNumber: item.rackNumber,
          shelfNumber: item.shelfNumber,
          items: []
        };
      }
      
      // Calculate discount for each item
      const discountInfo = calculateDiscount(item.expiryDate, item.mrp);
      
      rackData[locationKey].items.push({
        _id: item._id,
        productName: item.productName,
        genericName: item.genericName,
        category: item.category,
        quantity: item.quantity,
        packing: item.packing,
        expiryDate: item.expiryDate,
        batchId: item.batchId,
        mrp: item.mrp,
        discount: discountInfo.discount,
        discountedPrice: discountInfo.discountedPrice,
        daysUntilExpiry: discountInfo.daysUntilExpiry,
        monthsUntilExpiry: discountInfo.monthsUntilExpiry
      });
    });

    // Get unique locations and group by rack
    const locations = Object.keys(rackData).sort();
    const rackGroups = {};
    
    locations.forEach(locationKey => {
      const rackNumber = rackData[locationKey].rackNumber;
      if (!rackGroups[rackNumber]) {
        rackGroups[rackNumber] = [];
      }
      rackGroups[rackNumber].push(rackData[locationKey]);
    });

    res.status(200).json({
      success: true,
      data: {
        rackGroups,
        locations,
        totalRacks: Object.keys(rackGroups).length,
        totalShelves: locations.length,
        totalItems: stockItems.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rack management data',
      error: error.message
    });
  }
};

// Function to update all stock items with discount information
export const updateStockDiscounts = async (req, res) => {
  try {
    const stockItems = await Stock.find();
    let updatedCount = 0;
    
    for (const item of stockItems) {
      const discountInfo = calculateDiscount(item.expiryDate, item.mrp);
      
      // Update the item with discount information
      await Stock.findByIdAndUpdate(item._id, {
        discount: discountInfo.discount,
        discountedPrice: discountInfo.discountedPrice
      });
      
      updatedCount++;
    }
    
    res.status(200).json({
      success: true,
      message: `Updated discount information for ${updatedCount} stock items`,
      updatedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update stock discounts',
      error: error.message
    });
  }
};