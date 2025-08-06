import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  productName: { type: String, required: true },  // Changed from medicineName to productName
  batchId: { type: String, required: true },
  mrp: { type: Number, required: true },
  rate: { type: Number, required: true },
  gst: { type: Number, required: true },
  packing: { type: String, required: true },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  supplierName: { type: String, required: true },
  genericName: { type: String, required: true },  // Kept genericName as requested
  category: {  
    type: String,  
    enum: ['Tablets', 'Capsules', 'Syrups', 'Injections', 'Creams', 'Ointments', 'Essentials'],
    required: true 
  },  // Kept original medicine categories
  rackNumber: { type: String, required: true, default: 'Rack-1' },  // Rack number
  shelfNumber: { type: String, required: true, default: 'Shelf-1' },  // Shelf number for precise location
  discount: { type: Number, default: 0 },  // Discount percentage (0-100)
  discountedPrice: { type: Number, default: 0 }  // Calculated discounted price
});

const Stock = mongoose.model('Stock', stockSchema);

export default Stock;