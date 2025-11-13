import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Enable mongoose debug logs only in development
if (process.env.NODE_ENV !== "production") {
  mongoose.set("debug", true);
}

const connectDB = async () => {
  try {
    // Connection options for stability
    const options = {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout for finding a server
      socketTimeoutMS: 45000,          // 45 seconds socket timeout
      connectTimeoutMS: 30000,         // 30 seconds connection timeout
      family: 4,                       // Force IPv4
      ssl: true,
      tls: true,
      retryWrites: true,
      serverApi: {
        version: '1',                  // Use the latest stable API version
        strict: true,
        deprecationErrors: true,
      }
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Optional extra logs
    mongoose.connection.on("connected", () => {
      console.log("🔗 Mongoose connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("🔌 MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔁 MongoDB reconnected");
    });

    // Graceful shutdown (Ctrl+C)
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔌 MongoDB connection closed through app termination");
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
