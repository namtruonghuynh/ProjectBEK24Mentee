import app from './app';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
    console.log(`Statistics Service is running on port ${PORT}`);
});
