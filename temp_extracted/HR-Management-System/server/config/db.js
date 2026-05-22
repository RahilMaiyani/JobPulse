import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // Using 38;5;208 for that specific Ember/Orange accent
    console.log(`  \x1b[38;5;208m➜\x1b[0m  \x1b[1mDatabase:\x1b[0m  \x1b[32mConnected\x1b[0m \x1b[90m(${conn.connection.host})\x1b[0m`);
    
  } catch (error) {
    console.log(`\n  \x1b[41m\x1b[37m CRITICAL \x1b[0m \x1b[31mDatabase failure:\x1b[0m ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;