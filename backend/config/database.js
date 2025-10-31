import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

// Enable mongoose debug in non-production to get driver-level logs
if (process.env.NODE_ENV !== 'production') {
  mongoose.set('debug', true)
}

const connectDB = async () => {
  try {
    // More explicit options to help with unstable networks
    const opts = {
      // newer driver ignores these flags but harmless to keep
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // timeouts and keepAlive for more stability
      serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 30000,
      socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000,
      connectTimeoutMS: parseInt(process.env.MONGO_CONNECT_TIMEOUT_MS) || 30000,
      // family: 4 forces IPv4 which can help in some network setups
      family: 4,
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, opts)

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

    // Verbose connection event logging
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected')
    })

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('🔌 MongoDB disconnected')
    })

    mongoose.connection.on('reconnected', () => {
      console.log('🔁 MongoDB reconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      console.log('🔌 MongoDB connection closed through app termination')
      process.exit(0)
    })

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error)
    // don't exit immediately so we can see logs during debugging; caller can decide
    process.exit(1)
  }
}

export default connectDB