import mongoose from 'mongoose';

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) {  // Si la connexion n'est pas ouverte
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB', error);
      throw new Error('Failed to connect to MongoDB');
    }
  }
};

export default connectToDatabase;
