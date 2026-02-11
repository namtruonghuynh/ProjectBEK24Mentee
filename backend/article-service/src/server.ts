import app from './app';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/article-db';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Article Service connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Article Service is running on port ${PORT}`);
});
