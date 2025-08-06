import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Support both old and new environment variable names
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error("MongoDB URI not found in environment variables!");
      console.error("Please set either MONGODB_URI or MONGO_URI in your .env file");
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;